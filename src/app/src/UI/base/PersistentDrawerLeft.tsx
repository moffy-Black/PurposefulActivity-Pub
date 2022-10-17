import * as React from "react";
import { useNavigate } from "react-router-dom";

import Article from "@mui/icons-material/Article";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Logout from "@mui/icons-material/Logout";
import MeetingRoom from "@mui/icons-material/MeetingRoom";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import Content from "./Content";
import { funcLogout } from "../../components/base/logout";
import { AppBarStyle } from "./style/AppBarStyle";
import { ContentStyle } from "./style/ContentStyle";
import { DrawerHeaderStyle } from "./style/DrawerHeaderStyle"

export function PersistentDrawerLeft(props: { drawerWidth: number; }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleSignout = () => {
    const logoutResult = funcLogout();
    if (logoutResult) {
      navigate("../../signin");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBarStyle position="fixed" open={open} drawerWidth={props.drawerWidth} color="secondary">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={()=>{setOpen(true);}}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Purposeful Activity
          </Typography>
        </Toolbar>
      </AppBarStyle>
      <Drawer
        sx={{
          width: props.drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: props.drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeaderStyle>
          <IconButton onClick={()=>{setOpen(false);}}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeaderStyle>
        <Divider />
        <List>
          {["会議", "議事録"].map((text, index) => (
            <ListItem key={text} disablePadding>
              {index === 0 ? (
                <ListItemButton href="./meeting">
                  <ListItemIcon>
                    <MeetingRoom />
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              ) : (
                <ListItemButton href="./minutes">
                  <ListItemIcon>
                    <Article />
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              )}
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["ログアウト"].map((text, index) => (
            <ListItem key={text} disablePadding>
              {index === 0 ? (
                <ListItemButton onClick={handleSignout}>
                  <ListItemIcon>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              ) : (
                <ListItemButton>
                  <ListItemIcon>
                    <Article />
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>
      <ContentStyle open={open} drawerWidth={props.drawerWidth}>
        <DrawerHeaderStyle />
        <Content />
      </ContentStyle>
    </Box>
  );
};