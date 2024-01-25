package com.cointcompany.backend.domain.documents.controller;

import com.cointcompany.backend.domain.directories.repository.DirectoriesRepository;
import com.cointcompany.backend.domain.documents.dto.DocumentsDto;
import com.cointcompany.backend.domain.documents.entity.DocumentUsers;
import com.cointcompany.backend.domain.documents.repository.DocumentsRepository;
import com.cointcompany.backend.domain.documents.service.DocumentsService;
import com.cointcompany.backend.domain.file.repository.FilesRepository;
import com.cointcompany.backend.domain.projects.repository.ProjectsRepository;
import com.cointcompany.backend.domain.tasks.entity.Tasks;
import com.cointcompany.backend.domain.tasks.repository.TaskGroupRepository;
import com.cointcompany.backend.domain.tasks.repository.TasksRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Iterator;
import java.util.List;
@Tag(name = "파일", description = "파일 API 명세서")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/document")
@Slf4j
public class DocumentsController {

    private final ProjectsRepository projectsRepository;
    private final TasksRepository tasksRepository;
    private final TaskGroupRepository taskGroupRepository;
    private final DocumentsService documentsService;

    @Operation(summary = "파일 전체 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public List<DocumentsDto.GetDocuments> getDocumentsList() {
        return documentsService.findAllDocuments();
    }
    @Operation(summary = "파일 업로드")
    @ApiResponse(responseCode = "200", description = "업로드 성공")
    @PostMapping("/upload/{directoryId}")
    public ResponseEntity<Long> uploadDocuments(
            @RequestParam("file") MultipartFile file,
            @PathVariable Long directoryId
            ) {
        Long idNum = documentsService.uploadDocuments(file, directoryId).getIdNum();
        return new ResponseEntity<>(idNum, HttpStatus.OK);
    }

    @CrossOrigin(exposedHeaders = "Content-Disposition")
    @Operation(summary = "파일 다운로드")
    @ApiResponse(responseCode = "200", description = "다운로드 성공")
    @GetMapping("/download/{documentId}")
    public ResponseEntity<byte[]> downloadDocuments(@PathVariable Long documentId) {

        return documentsService.downloadDocuments(documentId);
    }

    @Operation(summary = "엑셀 업로드")
    @ApiResponse(responseCode = "200", description = "엑셀 업로드 성공")
    @PostMapping("/upload/excel")
    public String uploadExcel(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return "File is empty.";
        }

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();
            // 첫 번째 행은 헤더이므로 건너뛰고 데이터를 읽습니다.
            if (rowIterator.hasNext()) {
                rowIterator.next(); // 첫 번째 행(헤더)을 건너뜁니다.
            }
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                Tasks tasks = Tasks.of(
                        row.getCell(0).getStringCellValue(),
                        row.getCell(1).getStringCellValue(),
                        row.getCell(2).getLocalDateTimeCellValue().toLocalDate(),
                        row.getCell(3).getLocalDateTimeCellValue().toLocalDate(),
                        row.getCell(4).getStringCellValue(),
                        taskGroupRepository.findById((long) row.getCell(5).getNumericCellValue()).orElseThrow(),
                        projectsRepository.findById((long) row.getCell(5).getNumericCellValue()).orElseThrow()
                );
                tasksRepository.save(tasks);
            }

            return "File uploaded successfully.";
        }
    }

    @CrossOrigin(exposedHeaders = "Content-Disposition")
    @Operation(summary = "엑셀 다운로드")
    @ApiResponse(responseCode = "200", description = "다운로드 성공")
    @GetMapping("/download/excel/{projectId}")
    public void downloadExcel(HttpServletResponse response, @PathVariable Long projectId) throws IOException {
        List<Tasks> tasksList = tasksRepository.findByProjectsIdNum(projectId);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sheet1");

        CellStyle dateCellStyle = workbook.createCellStyle();
        short dateFormat = workbook.createDataFormat().getFormat("yyyy-MM-dd");
        dateCellStyle.setDataFormat(dateFormat);

        int rowNum = 0;
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("taskName");
        headerRow.createCell(1).setCellValue("description");
        headerRow.createCell(2).setCellValue("startDate");
        headerRow.createCell(3).setCellValue("endDate");
        headerRow.createCell(4).setCellValue("status");
        headerRow.createCell(5).setCellValue("taskId");
        // ... 다른 헤더 셀들 생성

        sheet.setColumnWidth(5,0);

        for (Tasks tasks : tasksList) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(tasks.getTaskName());
            row.createCell(1).setCellValue(tasks.getDescription());
            row.createCell(4).setCellValue(tasks.getStatus());
            // ... 다른 필드에 따라 셀들 생성

            // 날짜 데이터 포맷팅 및 셀 생성
            Cell dateCell = row.createCell(2);
            LocalDate localDate = tasks.getStartDate();
            dateCell.setCellValue(java.sql.Date.valueOf(localDate));
            dateCell.setCellStyle(dateCellStyle);
            dateCell = row.createCell(3);
            localDate = tasks.getEndDate();
            dateCell.setCellValue(java.sql.Date.valueOf(localDate));
            dateCell.setCellStyle(dateCellStyle);

            Cell cell = row.createCell(5);
            cell.setCellValue(tasks.getIdNum());
        }

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=data.xlsx");

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    @Operation(summary = "파일 전체 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/{directoryId}")
    public ResponseEntity<List<DocumentsDto.GetDocuments>> getDocuments (@PathVariable Long directoryId) {

        return new ResponseEntity<>(documentsService.findAllDocumentUsers(directoryId), HttpStatus.OK);
    }
    @Operation(summary = "파일 수정")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @PutMapping("/{documentId}")
    public ResponseEntity<String> modifyDocuments (
            @PathVariable("documentId") Long documentId,
            @RequestBody DocumentsDto.PostDocuments postDocuments
    ) {
        return new ResponseEntity<>(documentsService.modifyDocuments(postDocuments, documentId), HttpStatus.OK);
    }
    @Operation(summary = "파일 삭제")
    @ApiResponse(responseCode = "200", description = "삭제 성공")
    @DeleteMapping("/{directoryId}/{documentId}")
    public ResponseEntity<String> deleteDocuments (
            @PathVariable Long documentId) {

        return new ResponseEntity<>(documentsService.removeDocuments(documentId), HttpStatus.OK);
    }
    @Operation(summary = "파일 이동")
    @ApiResponse(responseCode = "200", description = "이동 성공")
    @PutMapping("/{documentId}/{directoryId}")
    public ResponseEntity<String> shiftDocuments (
            @PathVariable Long documentId,
            @PathVariable Long directoryId) {

        return new ResponseEntity<>(documentsService.shiftDocuments(documentId, directoryId), HttpStatus.OK);
    }
    @Operation(summary = "파일 복사")
    @ApiResponse(responseCode = "200", description = "복사 성공")
    @PostMapping("/{documentId}/{directoryId}")
    public ResponseEntity<String> copyDocuments (
            @PathVariable Long documentId,
            @PathVariable Long directoryId) {

        return new ResponseEntity<>(documentsService.copyDocuments(documentId, directoryId), HttpStatus.OK);
    }

    @Operation(summary = "파일 권한 추가")
    @ApiResponse(responseCode = "200", description = "권한 추가 성공")
    @PostMapping("/authority/{documentId}/{userId}")
    public ResponseEntity<String> addAuthorityDocuments (
            @PathVariable Long documentId,
            @PathVariable Long userId) {

        return new ResponseEntity<>(documentsService.addAuthorityDocuments(documentId, userId), HttpStatus.OK);
    }

    @Operation(summary = "파일 권한 조회")
    @ApiResponse(responseCode = "200", description = "권한 조회 성공")
    @GetMapping("/authority/{userId}")
    public ResponseEntity<List<DocumentsDto.DocumentUser>> getAuthorityDocuments (
            @PathVariable Long userId) {

        return new ResponseEntity<>(documentsService.findAuthorityDocumentsByUserId(userId), HttpStatus.OK);
    }


}