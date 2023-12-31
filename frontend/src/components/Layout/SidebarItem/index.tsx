// SidebarItem.tsx
import {Collapse, ListItem, ListItemIcon, ListItemText, List} from '@mui/material';
import {Link, useLocation} from 'react-router-dom';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import * as React from 'react';
import {useAppDispatch} from "../../../redux/store";
import {addOrActivateTab} from "../../../redux/tabSlice";
import {useState} from "react";

interface SidebarItemProps {
    title: string;
    icon: JSX.Element;
    items: string[];
    itemLink: string[];
    open: boolean;
    onClick: () => void;
}

const SidebarItem = ({title, icon, open, items, itemLink, onClick}: SidebarItemProps) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const dispatch = useAppDispatch();

    const handleItemClick = (itemName: string, itemPath: string) => {
        // Redux에 탭 정보 업데이트
        dispatch(addOrActivateTab({
            name: itemName,
            path: itemPath,
            active: true
        }));
    }

    return (
        <React.Fragment>
            <ListItem button onClick={onClick}  sx={{ color: '#c8c8c8'}}>
                <ListItemIcon style={{minWidth: '40px', textAlign: "center"}} >{icon}</ListItemIcon>
                <ListItemText primary={title} sx={{ color: open ? '#fff' : '#c8c8c8'  }} />
                {open ? <ExpandLess/> : <ExpandMore/>}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {items.map((item, idx) => {
                        // 현재 경로와 아이템의 링크가 일치하는 경우 handleItemClick 실행
                        if (currentPath === itemLink[idx]) {
                            handleItemClick(item, itemLink[idx]);
                        }
                        return (
                            <ListItem
                                button
                                component={Link}
                                to={`${itemLink[idx]}`}
                            >
                                <ListItemIcon style={{minWidth: '40px'}}>&nbsp;</ListItemIcon>
                                <ListItemText primary={item} sx={{
                                    color: '#c8c8c8',
                                    '& .MuiTypography-root': {
                                        fontSize: '14px'
                                    },
                                }}/>
                            </ListItem>
                            )
                    })}
                </List>
            </Collapse>
        </React.Fragment>
    );
}

export default SidebarItem;
