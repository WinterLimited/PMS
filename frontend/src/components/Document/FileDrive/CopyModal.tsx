import React, {useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from "../../../redux/axiosConfig";
import {Box, LinearProgress, Typography} from "@mui/material";
import { TreeView } from '@mui/x-tree-view/TreeView';
import ErrorModal from "../../common/ErrorModal";
import SuccessModal from "../../common/SuccessModal";
import {CloseSquare, MinusSquare, PlusSquare, StyledTreeItem} from "./DriveDirectory";

type dirResponse = {
    idNum: number;
    dirName: string;
    parentDirectoriesIdNum: number;
}

type selectDir = {
    dirName: string;
    idNum: number;
}

interface RenameModalProps {
    open: boolean;
    handleClose: () => void;
    idNumList: number[];
    handleCopy: (idNumList: number[], folderId: number) => void;
}

const CopyModal: React.FC<RenameModalProps> = ({ open, handleClose, idNumList, handleCopy }) => {
    const [directories, setDirectories] = useState<dirResponse[]>([]);
    const [rootDir, setRootDir] = useState<dirResponse>({} as dirResponse);
    const [loading, setLoading] = useState(true);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectDir, setSelectDir] = useState<selectDir>({} as selectDir);

    // 폴더 조회
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/directory`);
                setDirectories(response.data);
                setLoading(false);
            } catch (error) {
                setErrorMessage('폴더 조회 실패');
                setErrorModalOpen(true);
                return;
            }
        };
        fetchData();
    }, []);

    // 루트 디렉토리 설정
    useEffect(() => {
        if(directories.length === 0) {
            return;
        } else {
            const rootDir = directories.find(dir => dir.idNum === dir.parentDirectoriesIdNum);
            if (rootDir) {
                setRootDir(rootDir);
                setSelectDir(rootDir);
            } else {
                setErrorMessage('루트 폴더 조회 실패');
                setErrorModalOpen(true);
            }
        }
    }, [directories]);

    // 디렉토리 트리 렌더링
    const renderTree = (directory: dirResponse) => {
        if (!directory || directory.idNum === undefined) {
            console.error('유효하지 않은 디렉토리 객체:', directory);
            return null; // 무효한 디렉토리 객체를 건너뛰고 다음 요소로 이동합니다.
        }

        const children = directories.filter(
            dir => dir.parentDirectoriesIdNum === directory.idNum && dir.idNum !== rootDir.idNum
        );

        return (
            <StyledTreeItem key={directory.idNum} nodeId={directory.idNum.toString()} label={directory.dirName} onClick={() => setSelectDir(directory)}>
                {children.map(childDir => renderTree(childDir))}
            </StyledTreeItem>
        );
    };

    const isEmpty = (obj: any) => Object.keys(obj).length === 0;

    const handleSave = () => {
        handleCopy(idNumList, selectDir.idNum);
        setSelectDir({} as selectDir)
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}
                sx={{
                    '& .MuiDialog-paper': {
                        minWidth: '400px',
                        minHeight: '500px',
                    },
                }}>
            <DialogTitle>문서 복사</DialogTitle>
            <DialogContent>
                <Box sx={{ flexGrow: 1, width: '100%', backgroundColor: '#fff', borderRadius: '15px', p: 2, height: '400px' }}>
                    {loading && <LinearProgress/>}
                    <TreeView
                        aria-label="customized"
                        defaultExpanded={['1']}
                        defaultCollapseIcon={<MinusSquare />}
                        defaultExpandIcon={<PlusSquare />}
                        defaultEndIcon={<CloseSquare />}
                        sx={{ flexGrow: 1, maxWidth: 400, height: '100%' }}
                    >
                        {/* 샘플 디렉토리 */}
                        {!isEmpty(rootDir) ? renderTree(rootDir) : null}

                        {/*에러 발생 Modal*/}
                        <ErrorModal
                            open={errorModalOpen}
                            onClose={() => setErrorModalOpen(false)}
                            title="요청 실패"
                            description={errorMessage || ""}
                        />

                        {/*성공 확인 Modal*/}
                        <SuccessModal
                            open={successModalOpen}
                            onClose={() => setSuccessModalOpen(false)}
                            title="요청 성공"
                            description={successMessage || ""}
                        />
                    </TreeView>
                    {selectDir.idNum !== undefined && selectDir.idNum !== rootDir.idNum ?
                        <Typography sx={{ mt: 2, mb: 1, fontSize: '0.8rem' }}>선택한 폴더: {selectDir.dirName}</Typography> : null
                    }
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    취소
                </Button>
                <Button onClick={handleSave} color="primary">
                    복사
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CopyModal;
