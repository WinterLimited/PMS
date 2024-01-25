import React from 'react';
import { useTheme, styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Toolbar from "@mui/material/Toolbar";
import sidebarLogo from "../../assets/coint.png";
import Typography from "@mui/material/Typography";
import {
    ListAlt,
    Settings,
    AccountCircle,
    BarChart,
    BubbleChart, Construction,
    Factory, GridView,
    PieChart,
    SignalCellularAlt,
    Streetview,
    CloudDownload,
    EventNote
} from "@mui/icons-material";
import SidebarItem from "./SidebarItem";
import {getRole} from '../common/tokenUtils';

interface DrawerProps {
    open: boolean;
    drawerWidth: number;
}

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
}));

// List의 배열을 관리하기 위한 interface
interface SidebarItemState {
    title: string;
    icon: JSX.Element;
    items: string[];
    itemLink: string[];
    itemIcons?: JSX.Element[];
    open: boolean;
}

export default function SideDrawer({ open, drawerWidth }: DrawerProps) {
    const theme = useTheme();

    // TODO: DB에서 Sidebar Item 정보를 가져오는 것으로 변경
    // 현재 useState를 통해 SidebarItem들을 관리
    // Auth 정보에 따라 다른 SidebarItem을 보여주게 변경 가능
    const initialSidebarItems: SidebarItemState[] = [

        {title: "문서관리", icon: <CloudDownload sx={{ color: '#c8c8c8' }} />, items: ["드라이브"], itemLink: ["/document/drive"], open: false},
        {title: "프로젝트관리", icon: <ListAlt sx={{ color: '#c8c8c8' }} />, items: ["프로젝트조회", "업무조회", "업무리스트", "업무일정"], itemLink: ["/project/plan", "/project/task", "/project/task/kanbanboard", "project/task/calendar"], open: false},
        {title: "템플릿관리", icon: <EventNote sx={{ color: '#c8c8c8' }} />, items: ["템플릿조회", "프로젝트 복사"], itemLink: ["/template/list", "/template/copy"], open: false},
        // ROLE_ADMIN만 보여주는 메뉴
        ...(getRole() === "ROLE_ADMIN" ? [{title: "시스템관리", icon: <Settings sx={{ color: '#c8c8c8' }} />, items: ["사용자 관리", "사용자 그룹 관리", "부서 관리"], itemLink: ["/system/user", "/system/usergroup", "/system/department"], open: false}] : []),
        // Example
        // {title: "차트샘플", icon: <BarChart sx={{ color: '#c8c8c8' }} />, items: ["StackedBar Chart", "Pie Chart", "Scatter Chart", "Tree Chart"], itemLink: ["stackedbarchart", "piechart", "threedimscatterchart", "treemapchart"], open: false},
        // {title: "컴포넌트관리", icon: <GridView sx={{ color: '#c8c8c8' }} />, items: ["Kanban", "Gantt", "Document Editor", "Calendar", "Task List"], itemLink: ["kanban", "ganttchart", "documenteditor", "calendar", "tasklist"], open: false},
        // {title: "사용자관리", items: ["Menu1", "Menu2", "Menu3", "Menu4",], itemLink: ["menu1", "menu2", "menu3", "menu4"], icon: <AccountCircle sx={{ color: '#c8c8c8' }}/>, open: false},
    ];

    // handleClick을 통해 각 List의 open 상태관리
    const [sidebarItems, setSidebarItems] = React.useState<SidebarItemState[]>(initialSidebarItems);

    const handleItemClick = (title: string) => {
        setSidebarItems(sidebarItems.map(item =>
            item.title === title ? {...item, open: !item.open} : item
        ));
    };

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    height: '100%',
                    backgroundColor: 'rgb(40, 49, 66)',
                },
            }}
            variant="persistent"
            anchor="left"
            open={open}
        >
            <DrawerHeader>
                <Toolbar style={{width: '100%', padding: '0 10px'}}>
                    <img src={sidebarLogo} alt="Logo" style={{borderRadius: '100%', width: '40px', height: '40px', background: 'paddingBox rgb(2, 54, 113)', marginRight: '30px'}}/>
                    <Typography variant="h6" noWrap component="div" sx={{fontSize: '16px', fontWeight: 'bold', color: '#fff', fontFamily: 'Noto Sans KR', height: '100%'}}>
                        Coint Company <br/>
                        PMS
                    </Typography>
                </Toolbar>
            </DrawerHeader>
            {/* SidebarItem을 반복문을 통해 생성 */}
            <List>
                {sidebarItems.map((item, index) => (
                    <SidebarItem
                        key={index}     // Warning: Each child in a list should have a unique "key" prop. -> 추후 uuid 혹은 데이터베이스 id로 변경
                        title={item.title}
                        icon={item.icon}
                        items={item.items}
                        itemLink={item.itemLink}
                        open={item.open}
                        onClick={() => handleItemClick(item.title)}
                    />
                ))}
            </List>
        </Drawer>
    );
}
