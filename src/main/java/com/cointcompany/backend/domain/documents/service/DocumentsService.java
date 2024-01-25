package com.cointcompany.backend.domain.documents.service;

import com.cointcompany.backend.domain.directories.entity.Directories;
import com.cointcompany.backend.domain.directories.repository.DirectoriesRepository;
import com.cointcompany.backend.domain.documents.dto.DocumentsDto;
import com.cointcompany.backend.domain.documents.entity.DocumentUsers;
import com.cointcompany.backend.domain.documents.entity.Documents;
import com.cointcompany.backend.domain.documents.repository.DocumentUsersRepository;
import com.cointcompany.backend.domain.documents.repository.DocumentsRepository;
import com.cointcompany.backend.domain.file.entity.Files;
import com.cointcompany.backend.domain.file.repository.FilesRepository;
import com.cointcompany.backend.domain.users.entity.Users;
import com.cointcompany.backend.domain.users.repository.UsersRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class DocumentsService {

    private final DirectoriesRepository directoriesRepository;
    private final DocumentsRepository documentsRepository;
    private final FilesRepository filesRepository;
    private final UsersRepository usersRepository;

    private final DocumentUsersRepository documentUsersRepository;

    @Transactional(readOnly = true)
    public List<DocumentsDto.GetDocuments> findAllDocuments() {

        List<DocumentsDto.GetDocuments> getDocumentsList = new ArrayList<>();
        List<Documents> documentsList = documentsRepository.findAll();

        for (Documents documents : documentsList) {
            DocumentsDto.GetDocuments getDocuments = new DocumentsDto.GetDocuments(documents);
            getDocumentsList.add(getDocuments);
        }

        return getDocumentsList;
    }

    @Transactional
    public Documents uploadDocuments(MultipartFile file, Long directoryId) {

        try {

            Files files = Files.of(
                    URLEncoder.encode(file.getOriginalFilename(), StandardCharsets.UTF_8),
                    file.getBytes());

            filesRepository.save(files);

            Directories directories = directoriesRepository.findById(directoryId).orElseThrow();

            Documents documents = Documents.of(file.getOriginalFilename(), directories, files);


            return documentsRepository.save(documents);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public ResponseEntity<byte[]> downloadDocuments(Long documentId) {
        Optional<Files> files = filesRepository.findById(
                documentsRepository.findById(documentId).orElseThrow().getFiles().getIdNum()
        );

        if (files.isPresent()) {
            Files downloadFile = files.get();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + URLEncoder.encode(downloadFile.getFileName(), StandardCharsets.UTF_8) + "\"")
                    .body(downloadFile.getFileData());
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    @Transactional(readOnly = true)
    public List<DocumentsDto.GetDocuments> findAllDocumentUsers(Long directoryId) {

        List<DocumentsDto.GetDocuments> getDocumentsList = new ArrayList<>();
        List<Documents> documentsList = documentsRepository.findByDirectories_IdNum(directoryId);

        for (Documents documents : documentsList) {
            DocumentsDto.GetDocuments getDocuments = new DocumentsDto.GetDocuments(documents);
            getDocumentsList.add(getDocuments);
        }

        return getDocumentsList;
    }

    @Transactional
    public String modifyDocuments(DocumentsDto.PostDocuments postDocuments, Long documentId) {

        Documents documents = documentsRepository.findById(documentId).orElseThrow();
        documents.setDocName(postDocuments.getDocName());

        return "SUCCESS";

    }

    @Transactional
    public String removeDocuments(Long documentId) {

        documentsRepository.deleteById(documentId);

        return "SUCCESS";
    }
    @Transactional
    public String shiftDocuments(Long documentId, Long directoryId) {

        Documents documents = documentsRepository.findById(documentId).orElseThrow();
        documents.setDirectories(directoriesRepository.findById(directoryId).orElseThrow());

        return "SUCCESS";
    }
    @Transactional
    public String copyDocuments(Long documentId, Long directoryId) {

        Documents documents = documentsRepository.findById(documentId).orElseThrow();
        Directories directories = directoriesRepository.findById(directoryId).orElseThrow();
        Files files = Files.of(documents.getFiles().getFileName(), documents.getFiles().getFileData());
        filesRepository.save(files);
        Documents copyDocuments = Documents.of(documents.getDocName(), directories, files);
        documentsRepository.save(copyDocuments);

        return "SUCCESS";
    }

    @Transactional
    public String addAuthorityDocuments(Long documentId, Long userId) {

        Documents documents = documentsRepository.findById(documentId).orElseThrow();
        Users users = usersRepository.findById(userId).orElseThrow();
        DocumentUsers documentUsers = DocumentUsers.of(
                users,
                documents
        );
        documentUsersRepository.save(documentUsers);

        return "SUCCESS";
    }

    @Transactional(readOnly = true)
    public List<DocumentsDto.DocumentUser> findAuthorityDocumentsByUserId(Long userId) {
        return documentUsersRepository.findAllByUsersIdNum(userId)
                .stream()
                .map(docUser -> new DocumentsDto.DocumentUser(docUser))
                .collect(Collectors.toList());
    }
}
