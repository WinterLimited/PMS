package com.cointcompany.backend.domain.directories.dto;

import com.cointcompany.backend.domain.directories.entity.Directories;
import com.cointcompany.backend.domain.directories.entity.DirectoryUsers;
import com.cointcompany.backend.domain.users.entity.Users;
import lombok.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
@Getter
@Setter
public class DirectoriesDto {
    @NoArgsConstructor
    @Data
    public static class GetDirectories {
        private Long idNum;

        private String dirName;

        private Long parentDirectoriesIdNum;

        public GetDirectories (Directories directories) {

            this.idNum = directories.getIdNum();
            this.dirName = directories.getDirName();
            this.parentDirectoriesIdNum = directories.getParentDirectories().getIdNum();

        }
    }
    @NoArgsConstructor
    @Data
    public static class PostDirectories {

        private String dirName;

        public PostDirectories (String dirName) {

            this.dirName = dirName;

        }
    }
    @NoArgsConstructor
    @Data
    public static class GetDirectoryUsers {

        private Long directoriesIdNum;

        private Long usersIdNum;

        public GetDirectoryUsers (DirectoryUsers directoryUsers) {

            this.directoriesIdNum = directoryUsers.getDirectories().getIdNum();
            this.usersIdNum = directoryUsers.getUsers().getIdNum();

        }
    }

    @NoArgsConstructor
    @Data
    public static class GetParentDirectories {
        private Long idNum;

        private String dirName;

        private Long parentDirectoriesIdNum;

        private Long regUserid;

        private String regDate;

        private Long modUserid;

        private String modDate;


        public GetParentDirectories (Directories directories) {

            this.idNum = directories.getIdNum();
            this.dirName = directories.getDirName();
            this.parentDirectoriesIdNum = directories.getParentDirectories().getIdNum();
            this.regUserid = directories.getRegUserid();
            this.regDate = String.valueOf(directories.getRegDate());
            this.modUserid = directories.getModUserid();
            this.modDate = String.valueOf(directories.getModDate());

        }
    }

    @NoArgsConstructor
    @Data
    public static class DirectoryUser {
        private Long idNum;
        private int level;
        private Long directoriesIdNum;

        public DirectoryUser (DirectoryUsers directoryUsers) {
            this.idNum = directoryUsers.getUsers().getIdNum();
            this.level = directoryUsers.getLevel();
            this.directoriesIdNum = directoryUsers.getDirectoriesIdNum();
        }
    }

    @NoArgsConstructor
    @Data
    public static class UserAuthority {

        private Long userIdNum;

        public UserAuthority (DirectoryUsers directoryUsers) {

            this.userIdNum = directoryUsers.getUsers().getIdNum();

        }
    }
}
