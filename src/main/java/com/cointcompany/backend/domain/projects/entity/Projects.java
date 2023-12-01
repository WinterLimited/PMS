package com.cointcompany.backend.domain.projects.entity;

import com.cointcompany.backend.domain.common.BaseEntity;
import com.cointcompany.backend.domain.tasks.entity.Tasks;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Where(clause = "del = false")
@SQLDelete(sql = "UPDATE projects SET del = true WHERE id_num = ?")
public class Projects extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idNum;

    private String projectName;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;

    private Boolean confirm;

    private boolean del = Boolean.FALSE;

    @OneToMany(mappedBy = "projects", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<Tasks> tasksList = new ArrayList<>();

    @OneToMany(mappedBy = "projects", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<ProjectDepartment> projectsDepartments = new ArrayList<>();

    @OneToMany(mappedBy = "projects", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<ProjectUser> projectUsers = new ArrayList<>();

    public static Projects of (
            String projectName, String description, LocalDate startDate,
            LocalDate endDate, String status, Boolean confirm
    ) {
        return Projects.builder()
                .projectName(projectName)
                .description(description)
                .startDate(startDate)
                .endDate(endDate)
                .status(status)
                .confirm(confirm)
                .del(false)
                .build();
    }

    @Builder
    public Projects (
            String projectName, String description, LocalDate startDate,
            LocalDate endDate, String status,Boolean confirm, Boolean del
    ) {
        this.projectName = projectName;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.confirm = confirm;
        this.del = del;
    }

}
