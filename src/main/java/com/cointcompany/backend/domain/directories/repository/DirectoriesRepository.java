package com.cointcompany.backend.domain.directories.repository;

import com.cointcompany.backend.domain.directories.dto.DirectoriesDto;
import com.cointcompany.backend.domain.directories.entity.Directories;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DirectoriesRepository extends JpaRepository<Directories, Long> {
    List<Directories> findByParentDirectoriesIdNum(Long parentDirectoryId);

    Directories findByProjectsIdNum(Long projectId);

    Directories findByTasksIdNum(Long taskId);
}
