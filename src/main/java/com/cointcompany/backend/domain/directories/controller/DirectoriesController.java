package com.cointcompany.backend.domain.directories.controller;

import com.cointcompany.backend.domain.directories.dto.DirectoriesDto;
import com.cointcompany.backend.domain.directories.entity.Directories;
import com.cointcompany.backend.domain.directories.service.DirectoriesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "디렉토리", description = "디렉토리 API 명세서")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/directory")
public class DirectoriesController {

    private final DirectoriesService directoriesService;

    @Operation(summary = "디렉토리 전체 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public ResponseEntity<List<DirectoriesDto.GetDirectories>> getDirectories () {

        List<DirectoriesDto.GetDirectories> directoriesList = directoriesService.findAllDirectories();

        return new ResponseEntity<>(directoriesList, HttpStatus.OK);
    }

    @Operation(summary = "디렉토리 신규 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/{parentId}")
    public ResponseEntity<String> saveDirectories(
            @PathVariable Long parentId, @RequestBody DirectoriesDto.PostDirectories postDirectories
    ) {

        directoriesService.saveDirectories(postDirectories, parentId);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "프로젝트 디렉토리 신규 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/{parentId}/project/{projectId}")
    public ResponseEntity<Long> saveProjectDirectories(
            @PathVariable Long parentId, @PathVariable Long projectId, @RequestBody DirectoriesDto.PostDirectories postDirectories
    ) {

        Long idNum = directoriesService.saveProjectDirectories(postDirectories, parentId, projectId).getIdNum();

        return new ResponseEntity<>(idNum, HttpStatus.OK);
    }

    @Operation(summary = "작업 디렉토리 신규 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/{projectId}/task/{taskId}")
    public ResponseEntity<Long> saveTaskDirectories(
            @PathVariable Long projectId, @PathVariable Long taskId, @RequestBody DirectoriesDto.PostDirectories postDirectories
    ) {

        Long idNum = directoriesService.saveTaskDirectories(postDirectories, taskId, projectId).getIdNum();

        return new ResponseEntity<>(idNum, HttpStatus.OK);
    }

    @Operation(summary = "디렉토리 수정")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @PutMapping("/{directoryId}")
    public ResponseEntity<String> modifyDirectories(
            @PathVariable Long directoryId, @RequestBody DirectoriesDto.PostDirectories postDirectories
    ) {

        directoriesService.modifyDirectories(postDirectories, directoryId);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }


    // TODO: delete 처리하면 휴지통 디렉토리로 이동하도록 처리 필요
    // TODO: 휴지통 디렉토리에서 삭제 처리하면 아래의 코드 처리 필요
    @Operation(summary = "디렉토리 삭제")
    @ApiResponse(responseCode = "200", description = "삭제 성공")
    @DeleteMapping("/{directoryId}")
    public ResponseEntity<String> removeDirectories(
            @PathVariable Long directoryId
    ) {

        directoriesService.removeDirectories(directoryId);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "디렉토리 사용자 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/users")
    public ResponseEntity<List<DirectoriesDto.GetDirectoryUsers>> getDirectoryUsers () {

        List<DirectoriesDto.GetDirectoryUsers> directoryUsersList = directoriesService.findDirectoryUsers();

        return new ResponseEntity<>(directoryUsersList, HttpStatus.OK);
    }

    @Operation(summary = "부모 디렉토리 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/sub/{parentDirectoryId}")
    public ResponseEntity<List<DirectoriesDto.GetParentDirectories>> getParentDirectory (
            @PathVariable Long parentDirectoryId
    ) {

        return new ResponseEntity<>(directoriesService.findParentDirectory(parentDirectoryId), HttpStatus.OK);
    }

    @Operation(summary = "디렉토리 권한 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/authority/{userId}")
    public ResponseEntity<List<DirectoriesDto.DirectoryUser>> getDirectoryAuthority (
            @PathVariable Long userId
    ) {

        return new ResponseEntity<>(directoriesService.findAuthorityDirectoriesByUserId(userId), HttpStatus.OK);
    }

    @Operation(summary = "디렉토리 권한 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/{directoryId}/authority")
    public ResponseEntity<String> saveDirectoryAuthority (
            @PathVariable Long directoryId, @RequestBody List<DirectoriesDto.UserAuthority> userId
    ) {

        directoriesService.saveDirectoryAuthority(userId, directoryId);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "작업 디렉토리 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/task/{taskId}")
    public ResponseEntity<Long> getTaskDirectories (
            @PathVariable Long taskId
    ) {

        return new ResponseEntity<>(directoriesService.findTaskDirectoriesId(taskId), HttpStatus.OK);
    }

}
