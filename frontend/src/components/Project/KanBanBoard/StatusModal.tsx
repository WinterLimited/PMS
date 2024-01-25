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
    TextareaAutosize, Divider
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {useEffect, useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import * as React from "react";
import axios from "../../../redux/axiosConfig";
import ErrorModal from "../../common/ErrorModal";
import SuccessModal from "../../common/SuccessModal";
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {styled} from "@mui/material/styles";

type Task = {
    taskName: string,
    description: string,
    startDate: string,
    endDate: string,
    status: string | null,
    regDate: string,
    regUserid: string,
    projectName: string,
    projectsIdNum: number,
}

type Status = 'TODO' | 'WORKING' | 'WAITING' | 'DONE';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    idNum: number;
    setReloadData: (reloadData: boolean) => void;
}

type Data = {
    type: string,
    workTime: number,
    description: string,
}

type File = {
    name: string;
    size: number;
    type: string;
}

type TaskStatus = {
    idNum: number;
    status: string;
}


export default function StatusModal({ open, onClose, idNum, setReloadData }: ModalProps) {
    // Modal의 페이지네이션 구현
    const [data, setData] = useState<Data>({} as Data);
    const [files, setFiles] = useState<File[]>([]);
    const [fileName, setFileName] = useState<string>(''); // 파일 업로드
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isErrorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [taskInfo, setTaskInfo] = useState<Task>({} as Task);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData(prevData => ({ ...prevData, [event.target.name]: event.target.value }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const file = event.target.files[0];
        if (file) {
            setFiles([file]);
            setFileName(file.name);
        }
    }

    const SuccessClose = () => {
        setSuccessModalOpen(false);
        onClose();
    };

    const handleProjectSave = async () => {
            try {
                const response = await axios.post(`/api/task/work/${idNum}`, {
                    taskId: idNum,
                    workTime: data.workTime,
                    type: 'DONE',   // TODO
                    description: data.description,
                });

                // taskIdNum과 status를 TaskStatus 형태로 전송
                const taskStatus: TaskStatus = {
                    idNum,
                    status: 'WAITING'
                }

                axios.put("/api/task/status", taskStatus)
                    .then((response) => {
                        if (response.status === 200) {
                            setReloadData(true);
                            setReloadData(false);
                        }
                    })


                if (files.length > 0) {
                    const formData = new FormData();
                    formData.append('file', files[0]);
                    const taskUserResponse = await axios.get(`/api/task/user/${idNum}`);

                    const directoryId = await axios.get(`/api/directory/task/${idNum}`);
                    const response = await axios.post(`/api/document/upload/${directoryId.data}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    if (response.status === 200) {
                        // document 권한 부여
                        taskUserResponse.data.forEach((user: any) => {
                            axios.post(`/api/document/authority/${response.data}/${user.userId}`);
                        });

                        setSuccessModalOpen(true);
                    } else {
                        setErrorModalOpen(true);
                        setErrorMessage('파일 업로드 중 오류가 발생했습니다.');
                    }
                } else {
                    setSuccessModalOpen(true);
                }
            } catch (error) {
                setErrorModalOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('업무 공수 등록 중 오류가 발생했습니다.');
                }
            }
        }


    useEffect(() => {
        if(idNum === 0 || idNum == undefined) return;
        // 프로젝트 정보 가져오기
        axios.get(`/api/task/info/${idNum}`)
            .then((response) => {
                if (response.status === 200) {
                    setTaskInfo(response.data);
                } else {
                    setErrorMessage("업무 정보를 가져오는데 실패했습니다.");
                    setErrorModalOpen(true);
                }
            });

    }, [idNum]);

    const onEditorStateChange = (editorState: EditorState) => {
        setEditorState(editorState);

        // EditorState가 유효한지 확인
        if (!editorState || !editorState.getCurrentContent()) {
            return;
        }

        // EditorState를 raw content로 변환
        const rawContent = convertToRaw(editorState.getCurrentContent());
        // raw content를 JSON 문자열로 변환
        const jsonString = JSON.stringify(rawContent);
        // data의 description에 JSON 문자열 저장
        setData({ ...data, description: jsonString });
    };




    const Input = styled('input')({
        display: 'none',
    });

    return (
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
                        공수관리
                        </span>
                        <IconButton onClick={onClose} size="small" sx={{ padding: '0' }}>
                            <CloseIcon />
                        </IconButton>
                    </Typography>
                        <Box>
                            <Typography variant="h6"
                                        component={"div"}
                                        sx={{
                                            pb: 2,
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                    {taskInfo.taskName}
                                <span style={{fontSize: "14px", color: "dimgray"}}>
                                    {taskInfo.projectName}
                                </span>
                            </Typography>

                            <Divider />

                            <Grid container spacing={2} alignItems="center" sx={{ mt: 2, mb: 2 }}>
                                <Grid item xs={8}>
                                    <TextField
                                        label="공수 시간 (시간)"
                                        name="workTime"
                                        value={data.workTime}
                                        onChange={handleInputChange}
                                        type="number"
                                        inputProps={{ min: "0", step: "1" }}
                                        InputProps={{
                                            style: { fontSize: '14px', backgroundColor: 'transparent' }
                                        }}
                                        InputLabelProps={{
                                            style: { fontSize: '14px' },
                                            shrink: true,
                                        }}
                                    />
                                </Grid>


                                <Grid item xs={3} style={{padding: 0}}>
                                    <div>
                                        <Typography variant="h6" component="div" sx={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            첨부파일
                                        </Typography>
                                        <label htmlFor="contained-button-file">
                                            <Input accept="*/*" id="contained-button-file" multiple type="file" onChange={handleFileChange} />
                                            <Button variant="contained" component="span" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                                                {fileName ? <div style={{ marginTop: '10px', color: 'black' }}>{fileName}</div> : <CloudUploadIcon sx={{color: 'gray'}} />}
                                            </Button>
                                        </label>
                                    </div>
                                </Grid>
                            </Grid>

                            <Editor
                                editorState={editorState}
                                toolbarClassName="toolbarClassName"
                                wrapperClassName="wrapperClassName"
                                editorClassName="editorClassName"
                                onEditorStateChange={onEditorStateChange}
                            />
                        </Box>

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
                            저장
                        </Button>
                    </Box>

                    {/*성공 Modal*/}
                    <SuccessModal
                        open={isSuccessModalOpen}
                        onClose={SuccessClose}
                        title={""}
                        description={"업무의 공수관리가 정상적으로 등록되었습니다."}
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
    );
}
