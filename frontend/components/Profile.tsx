import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { getLoginUser } from "../lib/login";
import { useRouter } from "next/router";
import { InviteModalWithUserName } from "./InviteModal";
import EditIcon from "@mui/icons-material/Edit";

export default function Profile({ userName }: { userName: string }) {
  const router = useRouter();
  const me = getLoginUser();
  //   const [user, setUser]: any = useState({});
  const [userLadder, setUserLadder]: any = useState(0);
  const [testHistory, setTestHistory]: any[] = useState([]);
  const [inviteModal, setInviteModal] = useState(<></>);
  const [isBlocked, setIsBlocked] = useState(false);
  const [userId, setUserId] = useState("");
  const [userStatus, setUserStatus] = useState("OFFLINE");
  const [userImage, setUserImage] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);

  console.log(me);
  useEffect(() => {
    if (!router.isReady) return;

    axios
      .get(`/server/api/user?username=${userName}`)
      .then(function (res) {
        // setUser(...res.data);
        // setUser(res.data[0]);
        const user = res.data[0];
        setUserLadder(user.ladder);
        setUserId(user.id);
        setUserStatus(user.status);
        setUserImage(user.profileImage);
        console.log(`user:`);
        console.log(user);
        console.log(`${me.username} vs ${userName}`);
        if (me.username != userName) {
          setInviteModal(<InviteModalWithUserName userName={userName} />);
        } else {
          setInviteModal(<></>);
        }
        axios // isBlock?
          .get(`/server/api/user/block`)
          .then((res) => {
            console.log(res.data);
            const blocks = res.data;
            if (blocks.find((block: any) => block.blockedUserId.id === user.id))
              setIsBlocked(true);
          })
          .catch((e) => {
            console.error(e);
          });

        axios // history
          .get(`/server/api/user/${user.id}`)
          .then(function (res) {
            let brr: any = [];
            const historys = res.data.matchHistory;
            // console.log(`history data`);
            // console.log(res.data);
            for (let i in historys) {
              let time = `${historys[i].gameRoom.createdAt}`;
              brr.push(
                <Box>
                  <Grid container spacing={0}>
                    <Grid item xs={3}></Grid>
                    <Grid
                      item
                      xs={2}
                      sx={{
                        color: historys[i].user.win == "WIN" ? "blue" : "red",
                      }}
                    >
                      {historys[i].user.win}
                    </Grid>
                    <Grid item xs={3}>
                      {userName} {" VS"} {historys[i].other.profile.username}{" "}
                    </Grid>
                    <Grid item xs={4}></Grid>
                    <Grid item xs={12}>
                      {" score:"} {historys[i].user.score}
                      {" Ladder:"} {historys[i].user.ladder}
                      {" time:"} {time.slice(0, 10)}
                    </Grid>
                  </Grid>
                  <br />
                </Box>
              );
            }
            setTestHistory(brr);
          })
          .catch((e) => {
            console.error(e);
          });
      })
      .catch((e) => {
        console.error(e);
      });
    // if (user.ladder == 0) router.push("/clients");
  }, [router.isReady, userName]);

  if (!router.isReady) return <></>;

  function blockUser() {
    axios
      .post(`/server/api/user/block/${userId}`)
      .then((res) => {
        console.log(res.data);
        setIsBlocked(true);
      })
      .catch((e) => {
        console.error(e);
      });
  }
  function unBlock() {
    axios
      .patch(`/server/api/user/block/${userId}`)
      .then((res) => {
        console.log(res.data);
        setIsBlocked(false);
      })
      .catch((e) => {
        console.error(e);
      });
  }
  function ImageDialog() {
    return (
      <Dialog onClose={() => setImageOpen(false)} open={imageOpen}>
        <DialogTitle>select Image..</DialogTitle>
        <List sx={{ pt: 0 }}>
          <input type="file" id="fileInput" />
        </List>
      </Dialog>
    );
  }

  return (
    <Box>
      {/* <ListItemButton sx={{ justifyContent: "center" }}> */}
      <ImageDialog />
      <Box display="flex" justifyContent="center" sx={{ py: 2 }}>
        <Button
          onClick={() => {
            setImageOpen(true);
          }}
        >
          <Avatar sx={{ width: 100, height: 100 }} src={userImage} />
        </Button>
      </Box>
      <Box textAlign={"center"}>
        <Typography variant="h4" gutterBottom>
          {userName}{" "}
          {me.id === userId && (
            <>
              <IconButton
                onClick={() => {
                  setNameDialogOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
            </>
          )}
          <SetNameDialog
            setNameDialogOpen={setNameDialogOpen}
            nameDialogOpen={nameDialogOpen}
            accessToken={me.accessToken}
          />
        </Typography>
        <br />
        <Typography variant="h5" gutterBottom>
          ladder: {userLadder}
        </Typography>
        <Button
          color={
            userStatus === "ONLINE"
              ? "primary"
              : userStatus === "INGAME"
              ? "success"
              : "inherit"
          }
          variant="outlined"
          size="small"
        >
          {userStatus}
        </Button>{" "}
        {inviteModal}{" "}
        {userStatus === "INGAME" && (
          <Button
            color="success"
            variant="outlined"
            onClick={() => {
              axios
                .get("/server/api/game")
                .then((res) => {
                  const gameId = res.data.find(
                    (game: any) =>
                      game.leftUser.id === userId ||
                      game.rightUser.id === userId
                  ).id;
                  router.push(`/game/${gameId}`);
                })
                .catch((e) => {
                  console.error(e);
                });
            }}
          >
            관전하기
          </Button>
        )}{" "}
        {me.id !== userId &&
          (isBlocked ? (
            <Button color="inherit" variant="outlined" onClick={unBlock}>
              차단 해제
            </Button>
          ) : (
            <Button
              color="warning"
              variant="outlined"
              onClick={() => {
                blockUser();
                console.log(`profile: ${me.id} vs ${userId}`);
              }}
            >
              유저 차단
            </Button>
          ))}
        <br />
        <br />
        <Typography variant="h5" gutterBottom>
          History
        </Typography>
        {testHistory}
      </Box>
    </Box>
  );
}

function SetNameDialog({
  setNameDialogOpen,
  nameDialogOpen,
  accessToken,
}: any) {
  const router = useRouter();
  const [setName, setSetName] = useState("");

  return (
    <Dialog onClose={() => setNameDialogOpen(false)} open={nameDialogOpen}>
      <DialogTitle>Change name..</DialogTitle>
      <TextField
        label="name"
        variant="outlined"
        value={setName}
        onChange={(e) => {
          setSetName(e.target.value);
          console.log(setName);
        }}
      ></TextField>
      <List sx={{ pt: 0 }}></List>
      <Button
        variant="outlined"
        onClick={() => {
          if (setName.trim() == "")
            alert("공백으로만 이루어진 이름은 변경할수 없습니다");
          else {
            axios
              .patch("/server/api/user", {
                username: setName,
              })
              .then((res) => {
                setNameDialogOpen(false);
                const loginUser = {
                  id: res.data.id,
                  username: setName,
                  jwt: accessToken,
                };
                window.localStorage.setItem(
                  "loginUser",
                  JSON.stringify(loginUser)
                );
                router.push(`/profile/${setName}`);
              })
              .catch((e) => {
                console.error(e);
              });
          }
        }}
      >
        바꾸기
      </Button>
    </Dialog>
  );
}
