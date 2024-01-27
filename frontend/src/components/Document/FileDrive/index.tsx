import React, {useEffect, useState} from 'react';
import Drive from "./Drive";
import DriveDirectory from "./DriveDirectory";
import {Grid} from "@mui/material";
import DriveContext, { DirectoryAuthority, DocumentAuthority } from "./DriveContext";
import axios from "../../../redux/axiosConfig";
import {getUserId} from '../../common/tokenUtils';
import ErrorModal from "../../common/ErrorModal";

const FileDrive = () => {
    const [projectIdNum, setProjectIdNum] = useState<number>(0);
    const [directoryAuthorities, setDirectoryAuthorities] = useState<DirectoryAuthority[]>([]);
    const [documentAuthorities, setDocumentAuthorities] = useState<DocumentAuthority[]>([]);
    const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        // 예시로 axios를 사용, 다른 HTTP 클라이언트도 사용 가능
        const fetchDirectoryAuthorities = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/directory/authority/${getUserId()}`);

                // 새로운 권한 정보 생성
                const newAuthorities = [
                    {
                        idNum: Math.floor(Math.random() * 200000000) + 20000000000,
                        level: 1,
                        directoriesIdNum: 1,
                    },
                    {
                        idNum: Math.floor(Math.random() * 200000000) + 20000000000,
                        level: 1,
                        directoriesIdNum: 2,
                    },
                    {
                        idNum: Math.floor(Math.random() * 200000000) + 20000000000,
                        level: 1,
                        directoriesIdNum: 3,
                    }
                ];

                // 기존 데이터와 새로운 권한 정보를 결합
                const combinedAuthorities = response.data.concat(newAuthorities);

                setDirectoryAuthorities(combinedAuthorities);
            } catch (error) {
                setErrorMessage("디렉토리 권한을 불러오는데 실패했습니다.");
                setErrorModalOpen(true);
            }
        };

        const fetchDocumentAuthorities = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/document/authority/${getUserId()}`);
                setDocumentAuthorities(response.data);
            } catch (error) {
                setErrorMessage("문서 권한을 불러오는데 실패했습니다.");
                setErrorModalOpen(true);
            }
        };

        fetchDirectoryAuthorities();
        fetchDocumentAuthorities();
    }, []);

    return (
            <DriveContext.Provider value={{
                projectIdNum,
                setProjectIdNum,
                directoryAuthorities,
                setDirectoryAuthorities,
                documentAuthorities,
                setDocumentAuthorities
            }}>
                    <Grid container spacing={2}>
                        <Grid item xs={9}>
                                <Drive />
                        </Grid>
                        <Grid item xs={3}>
                                <DriveDirectory />
                        </Grid>
                    </Grid>

                {/*에러 발생 Modal*/}
                <ErrorModal
                    open={errorModalOpen}
                    onClose={() => setErrorModalOpen(false)}
                    title="요청 실패"
                    description={errorMessage || ""}
                />

            </DriveContext.Provider>
        );
};

export default FileDrive;
