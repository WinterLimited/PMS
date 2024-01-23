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
    TextareaAutosize, InputLabel, FormControl, Select, MenuItem
} from "@mui/material";
import {useEffect, useState} from "react";
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
import {AppDispatch, useAppDispatch, useAppSelector} from "../../../redux/store";

type Tag = {
    taskId: number;
    tagName: string;
}

type ProjectResponse = {
    idNum: number;
    projectName: string;
}

type Data = {
    taskName: string;
    description: string;
    startDate: string;
    endDate: string;
}

type User = {
    idNum: number;
    name: string;
    email: string;
    department: string;
    role: string;
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
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [selectProject, setSelectProject] = useState<ProjectResponse | null>(null);

    // Modal의 페이지네이션 구현
    const [page, setPage] = useState(1);
    const [data, setData] = useState<Data>({} as Data);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isErrorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [projectIdNum, setProjectIdNum] = useState<number>(0);
    const [usersList, setUsersList] = React.useState<User[]>([]);
    const [departmentsList, setDepartmentsList] = React.useState<Department[]>([]);

    useEffect(() => {
        // 프로젝트 목록 불러오기
        axios.get('/api/project')
            .then((response) => {
                const projectData = response.data.map((projectData: ProjectResponse) => ({
                    idNum: projectData.idNum,
                    projectName: projectData.projectName,
                }));
                setProjects(projectData);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);


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
                // project 선택 validation
                if(!selectProject) {
                    setErrorModalOpen(true);
                    setErrorMessage('프로젝트를 선택하지 않았습니다.');
                    return;
                } else {
                    const response = await axios.post(`/api/task/${selectProject.idNum}`, {
                        taskName: data.taskName,
                        description: data.description,
                        startDate: data.startDate,
                        endDate: data.endDate,
                    });

                    if(response.data) {
                        // response.data에는 taskIdNum 담겨있음
                        // 해당 API 요청을 통해 Tag를 등록
                        const tags: Tag[] = [];
                        const tagNames = data.taskName.split(' ').concat(data.description.split(' '));
                        // 중복 제거
                        const uniqueTagNames = [...new Set(tagNames)];
                        uniqueTagNames.forEach((tagName) => {
                            tags.push({
                                taskId: response.data,
                                tagName,
                            });
                        });
                        await axios.post(`/api/task/tag/${response.data}`, tags);

                        setProjectIdNum(response.data);
                    } else {
                        setErrorModalOpen(true);
                        setErrorMessage('성공적으로 업무를 등록하지 못했습니다.');
                    }
                    setPage(page+1);
                }
            } catch (error) {
                setErrorModalOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('성공적으로 프로젝트를 등록하지 못했습니다.');
                }
            }
        } else if (page === 2) {
            try {
                await axios.post(`/api/task/user/${projectIdNum}`, usersList.map((user) => {
                    // usersList에서 idNum과 role만 전송
                    return { userId: user.idNum, taskId: projectIdNum, taskRoleId: user.role };
                }));
                setPage(page+1);
            } catch (error) {
                setErrorModalOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('An unexpected error occurred');
                }
            }
        } else if (page === 3) {
            try {
                await axios.post(`/api/task/department/${projectIdNum}`, departmentsList.map((department) => {
                    // departmentsList에서 idNum과 role만 전송
                    return { departmentId: department.idNum, taskId: projectIdNum, role: department.role };
                }));

                const directoryResponse = await axios.post(`/api/directory/${selectProject.idNum}/task/${projectIdNum}`, { dirName: data.taskName });
                await axios.post(`/api/directory/${directoryResponse.data}/authority`, usersList.map((user) => {
                    return { userIdNum: user.idNum };
                }));

                // 프로젝트 등록 성공 시, 성공 Modal 띄우고 모든 Modal 닫기
                setSuccessModalOpen(true);
            } catch (error) {
                setErrorModalOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('An unexpected error occurred');
                }
            }
        }
    }

    return (
        <ProjectContext.Provider value={{
            selectProject,
            setSelectProject,
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
                        신규업무 등록
                        </span>
                        <IconButton onClick={onClose} size="small" sx={{ padding: '0' }}>
                            <CloseIcon />
                        </IconButton>
                    </Typography>

                    {page === 1 && (
                        // 프로젝트 정보 입력 컴포넌트
                        <Box>
                            <FormControl sx={{ mt: 1, display: 'block' }}>
                                <InputLabel id="demo-simple-select-label">프로젝트 선택</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    name="projectName"
                                    label="프로젝트 선택"
                                    value={selectProject == null ? '' : selectProject.projectName}
                                    sx={{ minWidth: '50%' }}
                                >
                                    {projects.map((project) =>
                                        (
                                        <MenuItem
                                            value={project.projectName}
                                            key={project.idNum}
                                            onClick={() => {
                                                setSelectProject({
                                                    idNum: project.idNum,
                                                    projectName: project.projectName
                                                });
                                            }}
                                        >
                                            {project.projectName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="업무명"
                                name="taskName"
                                variant="filled"
                                value={data.taskName}
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
                                aria-label="업무내용"
                                minRows={4}
                                name="description"
                                placeholder="업무의 상세내용을 입력하세요"
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
                                        label="업무 시작예정일"
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
                                        label="업무 종료예정일"
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
                        // 프로젝트 참여자 컴포넌트
                        <Box sx={{mb: 7}}>
                            <UserTable />
                        </Box>
                        )}
                    {page === 3 && (
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
                            저장 ( {page} / 3 )
                        </Button>
                    </Box>

                    {/*성공 Modal*/}
                    <SuccessModal
                        open={isSuccessModalOpen}
                        onClose={SuccessClose}
                        title={""}
                        description={"신규업무가 성공적으로 등록되었습니다"}
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
