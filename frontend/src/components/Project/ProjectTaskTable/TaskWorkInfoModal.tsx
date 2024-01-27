import {
    Button,
    Modal,
    Box,
    TextField,
    Typography,
    Table,
    TableBody,
    IconButton, Paper
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {useEffect, useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import * as React from "react";
import axios from "../../../redux/axiosConfig";
import ErrorModal from "../../common/ErrorModal";
import SuccessModal from "../../common/SuccessModal";
import { EditorState, convertFromRaw } from 'draft-js';
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
    workInfo: Data;
}

type Data = {
    type: string,
    workTime: number,
    regUserid: string,
    regDate: string,
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


export default function TaskWorkInfoModal({ open, onClose, idNum, workInfo }: ModalProps) {
    const [editorState, setEditorState] = useState<EditorState>(() =>
        EditorState.createEmpty()
    );
    const loadEditorContent = (savedContent: string) => {
        try {
            // 데이터베이스에서 불러온 JSON 문자열을 객체로 변환
            const content = JSON.parse(savedContent);
            // 변환된 객체를 Draft.js의 ContentState로 변환
            const contentState = convertFromRaw(content);
            // ContentState를 사용하여 EditorState 생성
            const editorState = EditorState.createWithContent(contentState);
            // EditorState 설정
            setEditorState(editorState);
        } catch (error) {
            console.error('에디터 내용을 불러오는 데 실패했습니다:', error);
            // 에러 처리
        }
    };

    useEffect(() => {
        loadEditorContent(workInfo?.description);
    }, [workInfo])

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
                                pb: 2,
                                mb: 2,
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

                <Box sx={{ mt: 2 }}>
                    <Paper sx={{ padding: 2 }}>
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                                <Typography variant="body2" sx={{ fontSize: '13px', color: '#888888', display: 'inline-block' }}>
                                    등록일: {workInfo?.regDate.substring(0, 10)}
                                </Typography>
                            </Typography>
                            <Box sx={{ mt: 2, p: 1 }}>
                                {
                                    editorState !== '' ? (
                                        <Editor
                                            editorState={editorState}
                                            readOnly={true}
                                            toolbarHidden={true}
                                            wrapperClassName="wrapper-class"
                                            editorClassName="editor-class"
                                            toolbarClassName="toolbar-class"
                                            localization={{
                                                locale: 'ko',
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="body2" ml={1} sx={{ fontSize: '13px', color: '#888888' }}>
                                            공수 내용이 없습니다.
                                        </Typography>
                                    )
                                }
                            </Box>
                        </Box>
                    </Paper>
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
                        onClick={onClose}
                    >
                        확인
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
