package com.cointcompany.backend.domain.tasks.entity;

import com.cointcompany.backend.domain.common.BaseEntity;
import com.cointcompany.backend.domain.projects.entity.ProjectRoles;
import com.cointcompany.backend.domain.projects.entity.Projects;
import com.cointcompany.backend.domain.users.entity.Users;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Where(clause = "del = false")
@SQLDelete(sql = "UPDATE task_user SET del = true WHERE id_num = ?")
public class TaskUser extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idNum;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "taskRoleId")
    private ProjectRoles taskRole;

    private boolean del = Boolean.FALSE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tasksIdNum")
    private Tasks tasks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userIdNum")
    private Users users;

    public static TaskUser of(ProjectRoles taskRole, Tasks tasks, Users users) {
        return TaskUser.builder()
                .taskRole(taskRole)
                .del(false)
                .tasks(tasks)
                .users(users)
                .build();
    }

    @Builder
    public TaskUser(ProjectRoles taskRole, Boolean del, Tasks tasks, Users users) {
        this.taskRole = taskRole;
        this.del = del;
        this.tasks = tasks;
        this.users = users;
    }
}