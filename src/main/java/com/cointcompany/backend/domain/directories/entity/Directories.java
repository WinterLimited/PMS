package com.cointcompany.backend.domain.directories.entity;

import com.cointcompany.backend.domain.common.BaseEntity;
import com.cointcompany.backend.domain.documents.entity.Documents;
import com.cointcompany.backend.domain.projects.entity.Projects;
import com.cointcompany.backend.domain.tasks.entity.Tasks;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import javax.validation.constraints.Null;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Where(clause = "del = false")
@SQLDelete(sql = "UPDATE Directories SET del = true WHERE id_num = ?")
public class Directories extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idNum;

    private String dirName;

    private Boolean del;

    @ManyToOne
    @JoinColumn(name = "parentIdNum")
    private Directories parentDirectories;

    @OneToOne
    @JoinColumn(name = "projectIdNum")
    @Nullable
    private Projects projects;

    @ManyToOne
    @JoinColumn(name = "taskIdNum")
    @Nullable
    private Tasks tasks;

    @OneToMany(mappedBy = "parentDirectories", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<Directories> subDirectories;

    @OneToMany(mappedBy = "directories", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<Documents> documents;

    @OneToMany(mappedBy = "directories", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<DirectoryUsers> directoryUsers;

    public static Directories of (
            String dirName, Directories parentDirectories, @Nullable Projects projects, @Nullable Tasks tasks
    ) {
        return Directories.builder()
                .dirName(dirName)
                .parentDirectories(parentDirectories) // 여기를 변경
                .projects(projects)
                .tasks(tasks)
                .del(false)
                .build();
    }

    @Builder
    public Directories(String dirName, Directories parentDirectories, // 여기도 변경
                       @Nullable Projects projects, @Nullable Tasks tasks, Boolean del) {
        this.dirName = dirName;
        this.parentDirectories = parentDirectories; // 여기도 변경
        this.projects = projects;
        this.tasks = tasks;
        this.del = del;
    }
}
