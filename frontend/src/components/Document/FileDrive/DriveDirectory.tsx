import * as React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { alpha, styled } from '@mui/material/styles';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import Collapse from '@mui/material/Collapse';
import { useSpring, animated } from '@react-spring/web';
import { TransitionProps } from '@mui/material/transitions';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import {useContext, useEffect, useState} from "react";
import axios from "../../../redux/axiosConfig";
import ErrorModal from "../../common/ErrorModal";
import SuccessModal from "../../common/SuccessModal";
import {Box, LinearProgress} from "@mui/material";
import DriveContext from "./DriveContext";

type dirResponse = {
    idNum: number;
    dirName: string;
    parentDirectoriesIdNum: number;
}

function MinusSquare(props: SvgIconProps) {
    return (
        <FolderOpenIcon sx={{ width: 14, height: 14 }} {...props} />
    );
}

function PlusSquare(props: SvgIconProps) {
    return (
        <FolderIcon sx={{ width: 14, height: 14 }} {...props}  />
    );
}

function CloseSquare(props: SvgIconProps) {
    return (
        <FolderOpenIcon
            className="close"
            fontSize="inherit"
            sx={{ width: 14, height: 14 }}
            {...props}
        >
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
        </FolderOpenIcon>
    );
}

function TransitionComponent(props: TransitionProps) {
    const style = useSpring({
        from: {
            opacity: 0,
            transform: 'translate3d(20px,0,0)',
        },
        to: {
            opacity: props.in ? 1 : 0,
            transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
        },
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
}

const StyledTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
        '& .close': {
            opacity: 0.3,
        },
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 15,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
}));

export default function CustomizedTreeView() {
    const [directories, setDirectories] = useState<dirResponse[]>([]);
    const [rootDir, setRootDir] = useState<dirResponse>({} as dirResponse);
    const [loading, setLoading] = useState(true);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const context = useContext(DriveContext);
    if (!context) {
        throw new Error("Cannot find ProjectProvider");
    }
    const { projectIdNum, setProjectIdNum, accessLevel } = context;

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
                setProjectIdNum(rootDir.idNum);
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
            <StyledTreeItem key={directory.idNum} nodeId={directory.idNum.toString()} label={directory.dirName} onClick={() => setProjectIdNum(directory.idNum)}>
                {children.map(childDir => renderTree(childDir))}
            </StyledTreeItem>
        );
    };

    const isEmpty = (obj: any) => Object.keys(obj).length === 0;

    return (
        <Box sx={{ flexGrow: 1, maxWidth: '400px', backgroundColor: '#fff', borderRadius: '15px', p: 2, height: '500px' }}>
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
        </Box>
    );
}