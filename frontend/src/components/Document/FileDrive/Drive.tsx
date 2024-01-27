import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
    Box,
    Avatar,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Grid, Menu, MenuItem, MenuProps, PopoverPosition, Divider, LinearProgress, Typography, Tooltip
} from '@mui/material';
import {MoreVert, DeleteOutline} from "@mui/icons-material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { getIconByFileType } from "./getIconByFileType";
import {alpha, styled} from "@mui/material/styles";
import RenameModal from "./RenameModal";
import axios from "../../../redux/axiosConfig";
import ErrorModal from "../../common/ErrorModal";
import { useDropzone } from 'react-dropzone';
import SuccessModal from "../../common/SuccessModal";
import {saveAs} from "file-saver";
import DriveContext from "./DriveContext";
import MoveModal from "./MoveModal";
import CopyModal from "./CopyModal";

interface docResponse {
    idNum: number;
    docName: string;
    regUserid: string;
    modDate: string;
}

interface dirResponse {
    idNum: number;
    dirName: string;
    parentDirectoriesIdNum: number;
    regUserid: string;
    modDate: string;
    regDate: string;
}

interface DocumentMenuProps {
    anchorEl: HTMLElement | null;
    menuPosition: PopoverPosition | undefined;
    menuOpen: boolean;
    onClose: () => void;
    onMenuItemClick: (action: string) => void;
    selectedItems: number[];
}

// 공용 폰트 스타일
const fontStyles = {
    font: 'var(--dt-title-small-font,500 .875rem/1.25rem "Google Sans"),"Google Sans",Roboto,Arial,sans-serif',
    letterSpacing: 'var(--dt-title-small-spacing,0.0178571429em)',
};

const StyledMenu = styled((props: MenuProps) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        border: 'none',
        borderRadius: 3,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
            theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.06) 0px 3px 3px -2px, rgba(0, 0, 0, 0.03) 0px 2px 4px -1px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
    },
}));

const DocumentOptionsMenu: React.FC<DocumentMenuProps> = ({
                                                              anchorEl,
                                                              menuPosition,
                                                              menuOpen,
                                                              onClose,
                                                              onMenuItemClick,
                                                              selectedItems,
                                                          }) => {

    const context = useContext(DriveContext);
    if (!context) {
        throw new Error("Cannot find ProjectProvider");
    }
    const {documentAuthorities} = context;

    /**
     기능별 권한 제한
     level 1 - 모든 기능 사용 가능
     level 2 - 이름변경, 복사, 이동 가능
     level 3 - 이동 가능
     level 4 - disabled
     */
        // selectedItems들의 권한 레벨을 가져옴
        // 그 권한 중 최댓값을 권한 레벨로 설정
    const currentDocumentAuthorityLevel = Math.max(...selectedItems.map(idNum => {
            const currentDocumentAuthority = documentAuthorities.find(auth => auth.documentsIdNum === idNum);
            return currentDocumentAuthority ? currentDocumentAuthority.level : 0;
        }));


    return (
        <StyledMenu
            anchorEl={anchorEl}
            anchorReference="anchorPosition" // 메뉴의 위치를 직접 지정
            anchorPosition={menuPosition} // 메뉴의 위치 설정
            open={menuOpen}
            onClose={onClose}
        >
            {/* TODO 공유 기능 추가 */}
            {
                // 접근 권한 별 메뉴 아이템 표시

                // selectedItems를 통해 선택된 아이템들의 모든 권한 레벨을 가져옴

                currentDocumentAuthorityLevel && currentDocumentAuthorityLevel > 1 ?
                    <Tooltip title="권한이 없습니다." placement="top">
                        <Box sx={{
                            opacity: 0.7,
                            filter: 'grayscale(1)',
                            cursor: 'not-allowed'
                        }}>
                            <MenuItem onClick={() => onMenuItemClick("download")}
                                      disabled
                                      sx={{...fontStyles}}>
                                <CloudDownloadIcon sx={{marginRight: '8px'}}/>
                                다운로드
                            </MenuItem>
                        </Box>
                    </Tooltip>
                    :
                    <MenuItem onClick={() => onMenuItemClick("download")}
                              sx={{...fontStyles}}>
                        <CloudDownloadIcon sx={{marginRight: '8px'}}/>
                        다운로드
                    </MenuItem>
            }
            {
                // 선택된 아이템이 1개 이상이거나 level이 2보다 크면 disabled
                selectedItems.length > 1 || currentDocumentAuthorityLevel && currentDocumentAuthorityLevel > 2 ?
                    <Tooltip title="권한이 없습니다." placement="top">
                        <Box sx={{
                            opacity: 0.7,
                            filter: 'grayscale(1)',
                            cursor: 'not-allowed'
                        }}>
                            <MenuItem onClick={() => onMenuItemClick("rename")}
                                      disabled
                                      sx={{...fontStyles}}>
                                <DriveFileRenameOutlineIcon
                                    sx={{marginRight: '8px'}}/>
                                이름변경
                            </MenuItem>
                        </Box>
                    </Tooltip>
                    :
                    <MenuItem onClick={() => onMenuItemClick("rename")}
                              sx={{...fontStyles}}>
                        <DriveFileRenameOutlineIcon
                            sx={{marginRight: '8px'}}/>
                        이름변경
                    </MenuItem>
            }
            <Divider sx={{my: 0.5}}/>
            {
                // level이 3보다 크면 disabled
                currentDocumentAuthorityLevel && currentDocumentAuthorityLevel > 3 ?
                    <Tooltip title="권한이 없습니다." placement="top">
                        <Box sx={{
                            opacity: 0.7,
                            filter: 'grayscale(1)',
                            cursor: 'not-allowed'
                        }}>
                            <MenuItem
                                onClick={() => onMenuItemClick("move")}
                                disabled
                                sx={{...fontStyles}}>
                                <DriveFileMoveIcon
                                    sx={{marginRight: '8px'}}/>
                                이동
                            </MenuItem>
                        </Box>
                    </Tooltip>
                    :
                    <MenuItem onClick={() => onMenuItemClick("move")}
                              sx={{...fontStyles}}>
                        <DriveFileMoveIcon
                            sx={{marginRight: '8px'}}/>
                        이동
                    </MenuItem>
            }
            {
                // level이 2보다 크면 disabled
                currentDocumentAuthorityLevel && currentDocumentAuthorityLevel > 2 ?
                    <Tooltip title="권한이 없습니다." placement="top">
                        <Box sx={{
                            opacity: 0.7,
                            filter: 'grayscale(1)',
                            cursor: 'not-allowed'
                        }}>
                            <MenuItem
                                onClick={() => onMenuItemClick("copy")}
                                disabled
                                sx={{...fontStyles}}>
                                <FileCopyIcon
                                    sx={{marginRight: '8px'}}/>
                                복사
                            </MenuItem>
                        </Box>
                    </Tooltip>
                    :
                    <MenuItem onClick={() => onMenuItemClick("copy")}
                              sx={{...fontStyles}}>
                        <FileCopyIcon
                            sx={{marginRight: '8px'}}/>
                        복사
                    </MenuItem>
            }
            <Divider sx={{my: 0.5}}/>
            {
                // level이 1보다 크면 disabled
                currentDocumentAuthorityLevel && currentDocumentAuthorityLevel > 1 ?
                    <Tooltip title="권한이 없습니다." placement="top">
                        <Box sx={{
                            opacity: 0.7,
                            filter: 'grayscale(1)',
                            cursor: 'not-allowed'
                        }}>
                            <MenuItem
                                onClick={() => onMenuItemClick("delete")}
                                disabled
                                sx={{...fontStyles}}>
                                <DeleteOutline sx={{marginRight: '8px'}}/>
                                삭제
                            </MenuItem>
                        </Box>
                    </Tooltip>
                    :
                    <MenuItem onClick={() => onMenuItemClick("delete")}
                              sx={{...fontStyles}}>
                        <DeleteOutline sx={{marginRight: '8px'}}/>
                        삭제
                    </MenuItem>
            }
        </StyledMenu>
    );
};

const Drive: React.FC = () => {
    const [documents, setDocuments] = useState<docResponse[]>([]);
    const [directory, setDirectory] = useState<dirResponse[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [moveItems, setMoveItems] = useState<number[]>([]);
    const [copyItems, setCopyItems] = useState<number[]>([]);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState({ docName: '', idNum: 0 });
    const firstSelectedIndexRef = useRef<number | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuPosition, setMenuPosition] = useState<PopoverPosition | undefined>(undefined);
    const [menuOpen, setMenuOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const context = useContext(DriveContext);
    if (!context) {
        throw new Error("Cannot find ProjectProvider");
    }
    const { projectIdNum, setProjectIdNum, documentAuthorities, directoryAuthorities } = context;

    // 파일 리스트 조회
    useEffect(() => {
        getFiles();
        getDirs();
    }, [projectIdNum]);

    // 파일 리스트 조회
    const getFiles = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/document/${projectIdNum}`);
            setDocuments(response.data);
            setLoading(false);
        } catch (error) {
            setErrorMessage('파일 리스트 조회 실패');
            setErrorModalOpen(true);
            return;
        }
    }

    // 디렉토리 리스트 조회
    const getDirs = async () => {
        // TODO 권한 설정 고민
        try {
            const response = await axios.get(`/api/directory/sub/${projectIdNum}`);

            

            // 권한 없으면 안보이는 방식으로 처리
            const filteredResponse = response.data.filter((dir: dirResponse) => {
                const authority = directoryAuthorities.find(auth => auth.directoriesIdNum === dir.idNum);
                return !(!authority || authority.level > 1);
            });

            setDirectory(filteredResponse);
        } catch (error) {
            setErrorMessage('디렉토리 리스트 조회 실패');
            setErrorModalOpen(true);
            return;
        }
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
    }, []);

    // files 상태가 변경되면 파일 업로드를 수행
    useEffect(() => {
        const uploadFiles = async () => {
            setLoading(true)
            if (files.length > 0) {
                handleFileUpload()
                    .then(() => {
                        setSuccessMessage('파일 업로드 성공');
                        setSuccessModalOpen(true);
                        setIsUploading(false);
                        // 파일 업로드 후 파일 리스트 조회
                        getFiles();
                        setLoading(false);
                        return;
                    })
                    .catch((error) => {
                        setErrorMessage('파일 업로드 실패');
                        setErrorModalOpen(true);
                        setIsUploading(false);
                        return;
                        setLoading(false);
                    });
            }
            setLoading(false);
        };

        uploadFiles();
    }, [files]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    });

    const handleNoneClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }

    const rootProps = getRootProps({
        onClick: handleNoneClick,
    });

    const handleFileUpload = async () => {

        setIsUploading(true);
        if (files.length > 0) {
            const formData = new FormData();
            formData.append('file', files[0]);
            const response = await axios.post(`/api/document/upload/${projectIdNum}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200) {
                return Promise.resolve();
            } else {
                return Promise.reject();
            }
        } else {
            return Promise.reject();
        }
    };

    const handleFileDownload = async (idNumList: number[]) => {
        for (const idNum of idNumList) {
            const response = await axios.get(`/api/document/download/${idNum}`, {
                responseType: 'blob',
            });
            console.log(response);
            if (response.status === 200) {
                const contentDisposition = response.headers['content-disposition'];
                // TODO: 파일 디코딩
                const fileName = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"/g, '') : 'unknown';
                const blob = new Blob([response.data], { type: 'application/octet-stream' });
                saveAs(blob, fileName);
            } else {
                setErrorMessage('파일 다운로드 실패');
                setErrorModalOpen(true);
                return;
            }
        }
    };

    // TODO 삭제 Modal
    const handleFileDelete = async (idNumList: number[]) => {
        for (const idNum of idNumList) {
            const response = await axios.delete(`/api/document/${projectIdNum}/${idNum}`);
            if (response.status === 200) {
                // 파일 삭제
                setDocuments(documents.filter((document) => document.idNum !== idNum));
                getFiles();
                setSuccessMessage('파일 삭제 성공');
                setSuccessModalOpen(true);
            } else {
                setErrorMessage('파일 삭제 실패');
                setErrorModalOpen(true);
                return;
            }
        }
    };

    const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault(); // 기본 브라우저 메뉴를 무시
        setMenuOpen(true);
        setAnchorEl(event.currentTarget);
        setMenuPosition({ top: event.clientY, left: event.clientX });
    };

    const handleMoreClick = (event: React.MouseEvent<HTMLElement>, selectedId: number) => {
        event.preventDefault(); // 기본 브라우저 메뉴를 무시
        setSelectedItems([selectedId]);
        setMenuOpen(true);
        setMenuPosition({ top: event.clientY, left: event.clientX });
    }

    const handleItemClick = (index: number, event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        const idNum = documents[index].idNum;

        // selectedItems이 비어있는 경우 현재 선택된 아이템의 인덱스를 저장
        if (selectedItems.length === 0) {
            firstSelectedIndexRef.current = index;
        }

        if (event.shiftKey) {   // shift key를 누르고 있는 경우
            if (firstSelectedIndexRef.current !== null) {
                const start = Math.min(firstSelectedIndexRef.current, index);
                const end = Math.max(firstSelectedIndexRef.current, index);
                const selected = documents.slice(start, end + 1).map((doc) => doc.idNum);
                setSelectedItems(selected);
            }
        } else if (event.metaKey) { // Ctrl key를 누르고 있는 경우
            setSelectedItems((prevSelectedItems) => {
                if (prevSelectedItems.includes(idNum)) {
                    return prevSelectedItems.filter((item) => item !== idNum);
                } else {
                    return [...prevSelectedItems, idNum];
                }
            });
        } else {    // 일반 클릭의 경우
            setSelectedItems([idNum]);
            firstSelectedIndexRef.current = index;
        }
    };

    const handleNoneItemClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setSelectedItems([]);
        firstSelectedIndexRef.current = null;
    }

    const handleDirChange = (idNum: number) => {
        setProjectIdNum(idNum);
    };

    const handleMenuOpen = (
        event: React.MouseEvent<HTMLButtonElement>,
        idNum: number
    ) => {
        setMenuPosition({ top: event.clientY, left: event.clientX });
        setAnchorEl(event.currentTarget);
        setSelectedItems([idNum]);
    };

    const handleMenuClose = () => {
        setMenuOpen(false)
        setAnchorEl(null);
        setMenuPosition(undefined);
        setSelectedItems([]);
        firstSelectedIndexRef.current = null;
    };


    const handleMenuItemClick = (action: string) => {
        handleMenuClose();

        if (!selectedItems) return;

        switch (action) {
            case "delete":
                handleFileDelete(selectedItems);
                break;
            case "rename":
                setSelectedDocument(documents.find((doc) => doc.idNum === selectedItems[0])!);
                setRenameModalOpen(true);
                break;
            case "download":
                handleFileDownload(selectedItems);
                break;
            case "move":
                setMoveItems(selectedItems)
                setMoveModalOpen(true);
                break;
            case "copy":
                setCopyItems(selectedItems);
                setCopyModalOpen(true);
                break;
            default:
                break;
        }
    };

    const handleRename = async (idNum: number, newName: string) => {
        await axios.put(`/api/document/${idNum}`, { docName: newName })
            .then((res) => {
                const updatedDocuments = documents.map((doc) => {
                    if (doc.idNum === idNum) {
                        return { ...doc, docName: newName };
                    } else {
                        return doc;
                    }
                });
                setDocuments(updatedDocuments);
            })
            .catch((err) => {
                setErrorMessage(err.response.data.message);
                setErrorModalOpen(true);
            });
    };

    const handleMove = async (idNumList: number[], targetFolderIdNum: number) => {
        const promises = idNumList.map((idNum) => {
            return axios.put(`/api/document/${idNum}/${targetFolderIdNum}`)
                .then((res) => {
                    return idNum;
                });
        });

        try {
            // 모든 요청이 완료될 때까지 기다린다.
            const movedIds = await Promise.all(promises);

            // 이동에 성공한 문서만 제외하고 나머지를 유지한다.
            const updatedDocuments = documents.filter((doc) => !movedIds.includes(doc.idNum));
            setDocuments(updatedDocuments);
            setSuccessMessage('파일 이동이 완료되었습니다');
            setSuccessModalOpen(true);
        } catch (err: any) {
            setErrorMessage(err.response.data.message);
            setErrorModalOpen(true);
        }
    }

    const handleCopy = async (idNumList: number[], targetFolderIdNum: number) => {
        for(const idNum of idNumList) {
            await axios.post(`/api/document/${idNum}/${targetFolderIdNum}`)
                .then((res) => {
                    setSuccessMessage('파일 복사가 완료되었습니다');
                    setSuccessModalOpen(true);
                    return idNum;
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.message);
                    setErrorModalOpen(true);
                });
        }
    }




    return (
        <Box sx={{ flexGrow: 1, maxWidth: '1200px', backgroundColor: '#fff', borderRadius: '15px', p: 2,  }}>
            {loading && <LinearProgress/>}
            {/*icon 추가를 위한 코드*/}
            <link href="https://cdn.materialdesignicons.com/6.4.95/css/materialdesignicons.min.css" rel="stylesheet" />

                    <List sx={{
                        width: '100%',
                        // focus 시에 outline이 생기는 것을 방지
                        '&:focus': {
                            outline: 'none',
                        }
                    }} {...rootProps}>
                        <input {...getInputProps()} />
                        {
                            isDragActive ? (
                                <Box sx={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    minHeight: '500px',
                                    border: '2px dashed var(--dt-primary-color,#2196f3)',
                                    borderRadius: '15px',
                                }}>
                                    <Typography variant="h5" sx={{color: 'var(--dt-primary-color,#2196f3)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontWeight: 'bold'}}>
                                        <CloudUploadIcon fontSize="large" />
                                        <span>파일을 끌어다 놓으세요</span>
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{minHeight: '500px'}}>
                                    {/*세부기능 버튼 추가*/}

                                    <ListItem sx={{
                                        width: '100%',
                                        borderBottom: '1px solid var(--dt-outline-variant,#dadce0)'
                                    }}
                                              onClick={handleNoneItemClick}>
                                        <ListItemText
                                            sx={{width: '49%'}}
                                            primary="파일명"
                                            primaryTypographyProps={{
                                                sx: fontStyles
                                            }}
                                        />
                                        <ListItemText
                                            sx={{width: '24%'}}
                                            primary="등록자"
                                            primaryTypographyProps={{
                                                sx: fontStyles
                                            }}
                                        />
                                        <ListItemText
                                            sx={{width: '28%'}}
                                            primary="최근 수정일"
                                            primaryTypographyProps={{
                                                sx: fontStyles
                                            }}
                                        />
                                        <ListItemSecondaryAction>
                                        </ListItemSecondaryAction>
                                    </ListItem>

                                    {directory.map((dir, index) => {
                                        // 본인의 idNum과 parentIdNum이 같은 폴더는 제외
                                        if (dir.idNum === dir.parentDirectoriesIdNum) return null;
                                        return (
                                            <ListItem
                                                key={dir.idNum}
                                                sx={{
                                                    width: '100%',
                                                    borderBottom: '1px solid var(--dt-outline-variant,#dadce0)',
                                                    height: '48px',
                                                    backgroundColor: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgb(240, 240, 240)' // 마우스 호버 시 배경색 변경
                                                    }
                                                }}
                                                // 더블 클릭 시 폴더로 이동
                                                onDoubleClick={() => handleDirChange(dir.idNum)}
                                                onMouseDown={(event) => event.preventDefault()}
                                                >
                                                <ListItemAvatar sx={{width: '2%'}}>
                                                    <i
                                                        className={"mdi mdi-folder"}
                                                        style={{
                                                            color: 'hsl(0, 0%, 40%)',
                                                            fontSize: '24px'
                                                        }}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText primary={dir.dirName}
                                                              sx={{width: '40%', overflow: 'auto'}}
                                                              primaryTypographyProps={{
                                                                  sx: fontStyles
                                                              }}
                                                />
                                                <ListItemAvatar sx={{
                                                    width: '24%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-start',
                                                }}>
                                                    <AccountCircleIcon sx={{
                                                        color: 'lightgray',
                                                        marginRight: '8px',
                                                        backgroundColor: '#fff',
                                                        borderRadius: '50%'
                                                    }}/>
                                                    <span style={{
                                                        font: 'var(--dt-title-small-font,400 .775rem/1.25rem "Google Sans"),"Google Sans",Roboto,Arial,sans-serif',
                                                        letterSpacing: 'var(--dt-title-small-spacing,0.0178571429em)'
                                                    }}>{dir.regUserid}</span>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    sx={{width: '24%'}}
                                                    primary={dir.modDate && dir.regDate.toString().substring(0, 10)}
                                                    primaryTypographyProps={{
                                                        sx: {
                                                            font: 'var(--dt-title-small-font,400 .775rem/1.25rem "Google Sans"),"Google Sans",Roboto,Arial,sans-serif',
                                                            letterSpacing: 'var(--dt-title-small-spacing,0.0178571429em)'
                                                        }
                                                    }}
                                                />
                                                <ListItemSecondaryAction>
                                                    <StyledMenu open={false}>
                                                        &nbsp;
                                                    </StyledMenu>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        )
                                    })}

                                    {documents.map((document, index) => {
                                        const {icon, color} = getIconByFileType(document.docName);

                                        /**
                                         기능별 권한 제한
                                         level 1 - 모든 기능 사용 가능
                                         level 2 - 이름변경, 복사, 이동 가능
                                         level 3 - 이동 가능
                                         level 4 - disabled
                                         */
                                        const currentDocumentAuthority = documentAuthorities.find(auth => auth.documentsIdNum === document.idNum);
                                        const currentDocumentAuthorityLevel = currentDocumentAuthority && currentDocumentAuthority.level;

                                        // currentDocumentAuthorityLevel이 4이상이거나 undefined이면 isDisabled를 true로 설정
                                        const isDisabled = currentDocumentAuthorityLevel && currentDocumentAuthorityLevel >= 4 || !currentDocumentAuthorityLevel;

                                        const DisListItem = (
                                            <ListItem
                                                key={document.idNum}
                                                sx={{
                                                    width: '100%',
                                                    borderBottom: selectedItems.includes(document.idNum) ? 'none' : '1px solid var(--dt-outline-variant,#dadce0)',
                                                    height: '48px',
                                                    backgroundColor: selectedItems.includes(document.idNum) ? 'rgb(178, 228, 253)' : 'white', // 선택되면 배경색을 변경
                                                    '&:hover': {
                                                        backgroundColor: selectedItems.includes(document.idNum) ? 'rgb(178, 228, 253)' : 'rgb(240, 240, 240)' // 마우스 호버 시 배경색 변경
                                                    }
                                                }}
                                                {
                                                    ...(currentDocumentAuthorityLevel && currentDocumentAuthorityLevel < 4) && {
                                                        onClick: (event) => handleItemClick(index, event), // 클릭 시 선택 상태를 토글
                                                        onContextMenu: (event) => handleRightClick(event),
                                                        onMouseDown: (event) => event.preventDefault()
                                                    } || {}
                                                }
                                            >
                                                <ListItemAvatar sx={{width: '2%'}}>
                                                    <i
                                                        className={icon}
                                                        style={{
                                                            color: color,
                                                            fontSize: '24px'
                                                        }}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText primary={document.docName}
                                                              sx={{width: '40%', overflow: 'auto'}}
                                                              primaryTypographyProps={{
                                                                  sx: fontStyles
                                                              }}
                                                />
                                                <ListItemAvatar sx={{
                                                    width: '24%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-start',
                                                }}>
                                                    <AccountCircleIcon sx={{
                                                        color: 'lightgray',
                                                        marginRight: '8px',
                                                        backgroundColor: '#fff',
                                                        borderRadius: '50%'
                                                    }}/>
                                                    <span style={{
                                                        font: 'var(--dt-title-small-font,400 .775rem/1.25rem "Google Sans"),"Google Sans",Roboto,Arial,sans-serif',
                                                        letterSpacing: 'var(--dt-title-small-spacing,0.0178571429em)'
                                                    }}>{document.regUserid}</span>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    sx={{width: '24%'}}
                                                    primary={document.modDate && document.modDate.toString().substring(0, 10)}
                                                    primaryTypographyProps={{
                                                        sx: {
                                                            font: 'var(--dt-title-small-font,400 .775rem/1.25rem "Google Sans"),"Google Sans",Roboto,Arial,sans-serif',
                                                            letterSpacing: 'var(--dt-title-small-spacing,0.0178571429em)'
                                                        }
                                                    }}
                                                />
                                                <ListItemSecondaryAction>
                                                    {
                                                        // 선택된 아이템이 1개 이상이거나 isDisabled가 true이면 disabled
                                                        selectedItems.length > 1 || isDisabled ?
                                                            <IconButton edge="end" aria-label="more" disabled>
                                                                <MoreVert/>
                                                            </IconButton>
                                                            :
                                                            <IconButton edge="end" aria-label="more"
                                                                        onClick={(event) => handleMoreClick(event, document.idNum)}>
                                                                <MoreVert/>
                                                            </IconButton>
                                                    }
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        );

                                        return isDisabled ? (
                                            <Tooltip title="권한이 없습니다." placement="top">
                                                <Box sx={{
                                                    opacity: 0.7,
                                                    filter: 'grayscale(1)',
                                                    cursor: 'not-allowed'
                                                }}>
                                                    {DisListItem}
                                                </Box>
                                            </Tooltip>
                                        ) : DisListItem;
                                    })}
                                    <ListItem
                                        sx={{
                                            width: '100%',
                                            borderBottom: '1px solid var(--dt-outline-variant,#dadce0)',
                                            height: '48px',
                                            backgroundColor: 'white', // 선택되면 배경색을 변경
                                        }}
                                    >
                                    </ListItem>
                                    <DocumentOptionsMenu
                                        anchorEl={anchorEl}
                                        menuPosition={menuPosition}
                                        menuOpen={menuOpen}
                                        onClose={handleMenuClose}
                                        onMenuItemClick={handleMenuItemClick}
                                        selectedItems={selectedItems}
                                    />
                                </Box>
                            )
                        }
                    </List>

            {/*이름 변경 Modal*/}
            <RenameModal
                open={renameModalOpen}
                handleClose={() => setRenameModalOpen(false)}
                document={selectedDocument}
                handleRename={handleRename}
            />

            {/*이동 Modal*/}
            <MoveModal
                open={moveModalOpen}
                handleClose={() => setMoveModalOpen(false)}
                idNumList={moveItems}
                handleMove={handleMove}
            />

            {/*복사 Modal*/}
            <CopyModal
                open={copyModalOpen}
                handleClose={() => setCopyModalOpen(false)}
                idNumList={copyItems}
                handleCopy={handleCopy}
            />

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
        </Box>
    );
};

export default Drive;
