import {
    Button,
    Modal,
    Box,
    TextField,
    Typography,
    Table,
    TableBody,
    IconButton,
    Grid,
    TextareaAutosize
} from "@mui/material";
import { useState } from "react";
import UserTable from "./UserTable";
import DepartmentTable from "./DepartmentTable";
import CloseIcon from "@mui/icons-material/Close";
import * as React from "react";
import axios from "../../../redux/axiosConfig";
import ErrorModal from "../../common/ErrorModal";
import SuccessModal from "../../common/SuccessModal";
import ProjectContext from './ProjectContext';
import {fetchTableData} from "../../../redux/tableSlice";
import {API_LINK} from "./data";
import { getRole } from '../../common/tokenUtils';
import {AppDispatch, useAppDispatch, useAppSelector} from "../../../redux/store";
import RoleTable from "./RoleTable";

type Tag = {
    projectId: number;
    tagName: string;
}

type Role = {
    projectId: number;
    roleName: string;
    roleLevel: number;
    description: string;
}

type Data = {
    projectName: string;
    description: string;
    startDate: string;
    endDate: string;
}

type User = {
    idNum: number;
    name: string;
    email: string;
    department: string;
    role: number;
}

type Department = {
    idNum: number;
    departmentName: string;
    description: string;
    role: string;
}

interface ModalProps {
    open: boolean;
    onClose: () => void;
}

export default function AddModal({ open, onClose }: ModalProps) {
    const dispatch = useAppDispatch();
    // Modal의 페이지네이션 구현
    const [page, setPage] = useState(1);
    const [data, setData] = useState<Data>({} as Data);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isErrorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [projectIdNum, setProjectIdNum] = useState<number>(0);
    const [rolesList, setRolesList] = React.useState<Role[]>([]);
    const [usersList, setUsersList] = React.useState<User[]>([]);
    const [departmentsList, setDepartmentsList] = React.useState<Department[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData(prevData => ({ ...prevData, [event.target.name]: event.target.value }));
    };

    const SuccessClose = () => {
        dispatch(fetchTableData(API_LINK));
        setSuccessModalOpen(false);
        onClose();
    };

    const handleProjectSave = async () => {
        if (page === 1) {
            try {
                // 경영진 계정인지 검증
                // 경영진이면 자체승인, 경영진이 아니라면 승인 절차
                const isAdmin: boolean = getRole() === 'ROLE_ADMIN';
                const response = await axios.post('/api/project', {
                    projectName: data.projectName,
                    description: data.description,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    isAdmin,
                });

                if (response.data) {
                    // response.data에는 projectIdNum이 담겨있음
                    // 해당 API 요청을 통해 Tag를 등록
                    const tags: Tag[] = [];
                    const tagNames = data.projectName.split(' ').concat(data.description.split(' '));
                    // 중복되는 키워드는 제거
                    const uniqueTagNames = [...new Set(tagNames)];
                    uniqueTagNames.forEach((tagName) => {
                        tags.push({
                            projectId: response.data,
                            tagName,
                        });
                    });
                    await axios.post(`/api/project/tag/${response.data}`, tags);

                    setProjectIdNum(response.data);
                } else {
                    setErrorModalOpen(true);
                    setErrorMessage('성공적으로 프로젝트를 등록하지 못했습니다.');
                }
                setPage(page + 1);
            } catch (error) {
                setErrorModalOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('성공적으로 프로젝트를 등록하지 못했습니다.');
                }
            }
        }
        // page 2 (프로젝트 권한 설정) 로직
        else if (page === 2) {
            try {
                await axios.post(`/api/project/role/${projectIdNum}`, rolesList);
                setPage(page + 1);
            } catch (error) {
                setErrorModalOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('프로젝트 권한 설정에 실패했습니다.');
                }
            }
        } else if (page === 3) {
            try {
                await axios.post(`/api/project/user/${projectIdNum}`, usersList.map((user) => {
                    // usersList에서 idNum과 role만 전송
                    return { userId: user.idNum, projectId: projectIdNum, projectRoleId: user.role };
                }));
                setPage(page+1);
            } catch (error) {
                setErrorModalOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('프로젝트에 사용자를 추가하는데 실패했습니다.');
                }
            }
        } else if (page === 4) {
            try {
                await axios.post(`/api/project/department/${projectIdNum}`, departmentsList.map((department) => {
                    // departmentsList에서 idNum과 role만 전송
                    return { departmentId: department.idNum, projectId: projectIdNum, role: department.role };
                }));

                const directoryResponse = await axios.post(`/api/directory/3/project/${projectIdNum}`, { dirName: data.projectName });
                await axios.post(`/api/directory/${directoryResponse.data}/authority`, usersList.map((user) => {
                    return { userIdNum: user.idNum };
                }));

                // email 요청
                if(getRole() !== 'ROLE_ADMIN') {
                    const emailMessage = {
                        to: 'chami0205@gmail.com',
                        subject: `프로젝트 승인 요청 - ${data.projectName}`,
                        html: `<!DOCTYPE html>
                            <html lang="ko">
                            <head>
                              <meta charset="UTF-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <title>프로젝트 승인요청</title>
                              <style>
                                body {
                                  font-family: Arial, sans-serif;
                                  display: flex;
                                  justify-content: center;
                                  align-items: center;
                                  height: 100vh;
                                  background-color: #f4f4f4;
                                }
                            
                                .container {
                                  width: 600px;
                                  padding: 20px;
                                  border: 1px solid #e1e1e1;
                                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                  background-color: #ffffff;
                                }
                            
                                .project-name {
                                  font-size: 18px;
                                  font-weight: bold;
                                  margin-top: 20px;
                                }
                            
                                .project-date {
                                  color: #777;
                                }
                            
                                .project-detail {
                                  font-size: 14px;
                                  margin-top: 20px;
                                  white-space: pre-line;
                                }
                            
                                .assignment-info, .task-info {
                                  font-size: 14px;
                                  margin-top: 20px;
                                }
                            
                                .approve-button {
                                  margin-top: 40px;
                                  display: flex;
                                  justify-content: center !important;
                                  text-align: center !important;
                                }
                            
                                a {
                                  padding: 10px 20px;
                                  font-size: 16px;
                                  border: none;
                                  border-radius: 4px;
                                  background-color: #333;
                                  color: #fff !important;
                                  cursor: pointer;
                                  text-decoration: none;
                                }
                            
                                a:hover {
                                  background-color: #555;
                                }
                              </style>
                            </head>
                            <body>
                            <div class="container">
                              <h1>프로젝트 승인 요청</h1>
                              <div class="project-name">${data.projectName}</div>
                              <span class="project-date">기간(${data.startDate} ~ ${data.endDate})</span>
                            
                              <div class="project-detail">
                                ${data.description}
                              </div>
                            
                              <div class="assignment-info">배정인원 : ${usersList.length}명</div>
                              <div class="task-info">업무 : 아직 생성된 업무가 없습니다.</div>
                            
                              <div class="approve-button">
                                <a href="http://localhost:3000/project/plan">세부 내용</a>
                              </div>
                            </div>
                            </body>
                            </html>
                            `
                    };
                    await axios.post('/api/mail/project', emailMessage);
                }

                // 프로젝트 등록 성공 시, 성공 Modal 띄우고 모든 Modal 닫기
                // 페이지 초기화
                setPage(1);
                setSuccessModalOpen(true);
            } catch (error) {
                setErrorModalOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('프로젝트에 부서를 추가하는데 실패했습니다.');
                }
            }
        }
    }

    return (
        <ProjectContext.Provider value={{
            rolesList,
            setRolesList,
            usersList,
            setUsersList,
            departmentsList,
            setDepartmentsList,
        }}>
            <Modal open={open}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    minWidth: 600,
                    minHeight: '40vh',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    borderRadius: '10px',
                }}>
                    <Typography variant="h6"
                                component={"div"}
                                sx={{
                                    borderBottom: '2px solid #f0f0f0',
                                    pb: 2,
                                    mb: 2,
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                        <span>
                        프로젝트 신규등록
                        </span>
                        <IconButton onClick={onClose} size="small" sx={{ padding: '0' }}>
                            <CloseIcon />
                        </IconButton>
                    </Typography>

                    {page === 1 && (
                        // 프로젝트 정보 입력 컴포넌트
                        <Box>
                            <TextField
                                label="프로젝트명"
                                name="projectName"
                                variant="filled"
                                value={data.projectName}
                                onChange={handleInputChange}
                                sx={{ mt: 1, width: '50%' }}
                                InputProps={{
                                    style: { fontSize: '14px', backgroundColor: 'transparent' }
                                }}
                                InputLabelProps={{
                                    style: { fontSize: '14px' },
                                }}
                            />
                            <TextareaAutosize
                                aria-label="프로젝트 상세설명"
                                minRows={4}
                                name="description"
                                placeholder="프로젝트 상세설명을 입력하세요"
                                value={data.description}
                                onChange={handleInputChange}
                                style={{
                                    fontSize: '14px',
                                    width: '100%',
                                    padding: '10px',
                                    marginTop: '10px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    resize: 'vertical'
                                }}
                            />

                            <Grid container spacing={2} sx={{mt: 3}}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="프로젝트 시작예정일"
                                        variant="outlined"
                                        type="date"
                                        name="startDate"
                                        value={data.startDate}
                                        onChange={handleInputChange}
                                        fullWidth
                                        InputProps={{
                                            style: { fontSize: '14px', backgroundColor: 'transparent' }
                                        }}
                                        InputLabelProps={{
                                            style: { fontSize: '14px' },
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="프로젝트 종료예정일"
                                        variant="outlined"
                                        type="date"
                                        name="endDate"
                                        value={data.endDate}
                                        onChange={handleInputChange}
                                        fullWidth
                                        InputProps={{
                                            style: { fontSize: '14px', backgroundColor: 'transparent' }
                                        }}
                                        InputLabelProps={{
                                            style: { fontSize: '14px' },
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                    {page === 2 && (
                        // 프로젝트 권한 부여 컴포넌트
                        <Box sx={{mb: 7}}>
                            <RoleTable projectId={projectIdNum} />
                        </Box>
                    )}
                    {page === 3 && (
                        // 프로젝트 참여자 컴포넌트
                        <Box sx={{mb: 7}}>
                            <UserTable />
                        </Box>
                        )}
                    {page === 4 && (
                        // 프로젝트 참여부서 컴포넌트
                        <Box sx={{mb: 7}}>
                            <DepartmentTable />
                        </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            sx={{
                                marginLeft: '10px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                height: '35px',
                                backgroundColor: 'rgb(40, 49, 66)',
                                boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important',
                                textTransform: 'none',
                                minWidth: '75px',
                                padding: '0 12px',
                                '&:hover': {
                                    textDecoration: 'none',
                                    backgroundColor: 'rgb(40, 49, 66, 0.8)',
                                },
                            }}
                            onClick={handleProjectSave}
                        >
                            저장 ( {page} / 4 )
                        </Button>
                    </Box>

                    {/*성공 Modal*/}
                    <SuccessModal
                        open={isSuccessModalOpen}
                        onClose={SuccessClose}
                        title={""}
                        description={"프로젝트가 성공적으로 등록되었습니다"}
                    />

                    {/*에러 발생 Modal*/}
                    <ErrorModal
                        open={isErrorModalOpen}
                        onClose={() => setErrorModalOpen(false)}
                        title="요청 실패"
                        description={errorMessage || ""}
                    />
                </Box>
            </Modal>
        </ProjectContext.Provider>
    );
}
