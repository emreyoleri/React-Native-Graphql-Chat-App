import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Image from "next/image";

const twoPersonContext = [
  {
    _id: "62742434f8bcda00a9f62b16",
    users: [
      {
        name: "emre",
        email: "emre@gmail.com",
        _id: "6272bc18f8bcda00a9f62b08",
      },
      {
        name: "merve",
        email: "merve@gmail.com",
        _id: "6272bc1cf8bcda00a9f62b0b",
      },
    ],
    messages: [],
  },
];

const context = [
  {
    _id: "62742496f8bcda00a9f62b23",
    name: "Aile",
    users: [
      {
        name: "merve",
        email: "merve@gmail.com",
        _id: "6272bc1cf8bcda00a9f62b0b",
        isAdmin: true,
      },
      {
        name: "emre",
        email: "emre@gmail.com",
        _id: "6272bc18f8bcda00a9f62b08",
        isAdmin: false,
      },
    ],
    messages: [],
    createdAt: "1651778710589",
    createdBy: "6272bc1cf8bcda00a9f62b0b",
    photoURL:
      "https://www.iconbunny.com/icons/media/catalog/product/cache/2/thumbnail/600x/1b89f2fc96fc819c2a7e15c7e545e8a9/1/5/1543.1-clients-icon-iconbunny.jpg",
  },
];

const drawerWidth = 240;

function ResponsiveDrawer(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const myContexts = [...context, ...twoPersonContext];

  console.log("myContexts:", myContexts);

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {myContexts.map((cxt, index) => (
          <ListItem button key={cxt._id}>
            {cxt.name ? (
              <Avatar alt="Remy Sharp" src={cxt.photoURL} />
            ) : (
              <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
            )}

            {cxt.name ? (
              <ListItemText primary={cxt.name} />
            ) : (
              <ListItemText primary={cxt.users[0].name} />
            )}
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {["All mail", "Trash", "Spam"].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>
              {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Messages
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
      </Box>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;
