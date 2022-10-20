import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { EmojiPeople } from "@mui/icons-material";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";


const theme = createTheme();

const Land = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: 2,
            norderColor: 'primary.main'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <EmojiPeople />
          </Avatar>
          <Typography component="h1" variant="h5">
            welcome Purposeful Activity!
          </Typography>
          <Box sx={{ mt: 1}} >
          <List>
            <ListItem disablePadding>
              <ListItemButton href="/signin/" >
                <ListItemText primary="SignIn" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/signup/" >
                <ListItemText primary="SignUp" />
              </ListItemButton>
            </ListItem>
        </List>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Land