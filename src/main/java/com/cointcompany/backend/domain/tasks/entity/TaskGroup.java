package com.cointcompany.backend.domain.tasks.entity;

import com.cointcompany.backend.domain.common.BaseEntity;
import com.cointcompany.backend.domain.projects.entity.Projects;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Where(clause = "del = false")
@SQLDelete(sql = "UPDATE task_group SET del = true WHERE id_num = ?")
public class TaskGroup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idNum;

    private String taskGroupName;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projectsIdNum")
    private Projects projects;

    private boolean del = Boolean.FALSE;

    public static TaskGroup of (
            String taskGroupName, String description, Projects projects
    ) {
        return TaskGroup.builder()
                .taskGroupName(taskGroupName)
                .description(description)
                .projects(projects)
                .del(false)
                .build();
    }

    @Builder
    public TaskGroup(
            String taskGroupName, String description, Projects projects, boolean del
    ) {
        this.taskGroupName = taskGroupName;
        this.description = description;
        this.projects = projects;
        this.del = del;
    }
}
