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
  Switch,
  TextField,
  Typography,
  DialogActions,
  Chip,
  Badge,
} from "@mui/material";
import { useEffect, useState, forwardRef, useContext } from "react";
import axios from "axios";
import { getLoginUser } from "../lib/login";
import { useRouter } from "next/router";
import { InviteModalWithUserName } from "./InviteModal";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";
import { regex } from "../lib/regex";
import { useQRCode } from "next-qrcode";
import Image from "next/image";
import { UserImageContext } from "../lib/contexts";

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
  // const [userImage, setUserImage] = useState("");
  const { userImage, setUserImage } = useContext(UserImageContext);
  const [imageOpen, setImageOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);

  const [checked, setChecked] = useState(false);
  const [twoFaDialogOpen, setTwoFaDialogOpen] = useState(false);
  const [QRCode, setQRCode] = useState("");
  const [inputCode, setInputCode] = useState("");

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
        setChecked(user.twoFactorAuth);
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
              let time = new Date(
                historys[i].gameRoom.startAt
              ).toLocaleString();
              brr.push(
                <Box>
                  <Grid container spacing={0}>
                    <Grid item xs={12}>
                      <Chip
                        label={historys[i].user.win}
                        size="small"
                        color={
                          historys[i].user.win === "WIN" ? "primary" : "error"
                        }
                        sx={{
                          mx: "auto", // margin left & right
                          my: 1, // margin top & botom
                          borderRadius: "sm",
                          boxShadow: "md",
                          alignItems: "center",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      {userName} {" VS"} {historys[i].other.username}
                    </Grid>
                    <Grid item xs={12}>
                      {historys[i].user.username}
                      {" : "}
                      {" score:"} {historys[i].user.score}
                      {" Ladder:"} {historys[i].user.ladder}
                    </Grid>
                    <Grid item xs={12}>
                      {historys[i].other.username}
                      {" : "}
                      {" score:"} {historys[i].other.score}
                      {" Ladder:"} {historys[i].other.ladder}
                    </Grid>
                    <Grid item xs={12}>
                      {" time:"}{" "}
                      {new Date(historys[i].gameRoom.startAt).toLocaleString()}
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

  return (
    <Box>
      {/* <ListItemButton sx={{ justifyContent: "center" }}> */}
      <ImageDialog open={imageOpen} onClose={() => setImageOpen(false)} />
      <Box display="flex" justifyContent="center" sx={{ py: 2 }}>
        <Button
          onClick={() => {
            setImageOpen(true);
          }}
        >
          <Badge
            badgeContent={
              <EditIcon
                sx={{
                  py: 0.5,
                  px: 0.5,
                  margin: 0,
                  border: 1,
                  borderRadius: 50,
                }}
              />
            }
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            <Avatar sx={{ width: 100, height: 100 }} src={userImage} />
          </Badge>
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
        </Button>
        {me.id === userId && (
          <Box
            justifyContent="center"
            sx={{ alignItems: "center", display: "flex", flexDirection: "row" }}
          >
            <Typography variant="h6">2FA</Typography>
            <Switch
              checked={checked}
              onChange={async () => {
                if (checked == false) {
                  setTwoFaDialogOpen(true);
                  await axios.get(`/server/api/auth/2fa-qrcode`).then((res) => {
                    /////////////////   set qrcode   ///////////////
                    setQRCode(res.data);
                  });
                } else {
                  axios
                    .patch(`/server/api/user`, {
                      twoFactorAuth: false,
                    })
                    .then((res) => {
                      setChecked(false);
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                }
              }}
              inputProps={{ "aria-label": "controlled" }}
            />
          </Box>
        )}
        <Dialog
          open={twoFaDialogOpen}
          onClose={() => {
            setTwoFaDialogOpen(false);
          }}
        >
          <DialogTitle>OTP</DialogTitle>
          <Image src={QRCode} width={250} height={250} />
          {/* //////////////// QRCODE //////////////// */}
          <TextField
            label="OTP code"
            variant="outlined"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              console.log(inputCode);
            }}
          ></TextField>
          <List sx={{ pt: 0 }}></List>

          <Button
            variant="outlined"
            onClick={() => {
              //////////////////////   2FA Code   //////////////////////
              axios
                .patch(`/server/api/user`, {
                  twoFactorAuth: true,
                  otp: inputCode,
                })
                .then((res) => {
                  setChecked(true);
                  setTwoFaDialogOpen(false);
                })
                .catch((e) => {
                  setChecked(false);
                });
            }}
          >
            인증하기
          </Button>
        </Dialog>
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

function ImageDialog({ open, onClose }) {
  const [image, setImage] = useState(null);
  const { userImage, setUserImage } = useContext(UserImageContext);

  function handleClose() {
    setImage(null);
    onClose();
  }

  function handleImageSelect(event) {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setImage(img);
    }
  }

  function handleSubmit() {
    if (image) {
      const body = new FormData();
      body.append("profileImage", image);
      axios({
        headers: {
          "Content-Type": "multipart/form-data",
        },
        url: `/server/api/user/profile-image`, // 파일 업로드 요청 URL
        method: "PATCH",
        data: body,
      })
        .then((res) => {
          handleClose();
          setUserImage(res.data.profileImage);
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      axios({
        headers: {
          "Content-Type": "multipart/form-data",
        },
        url: `/server/api/user/profile-image`, // 파일 업로드 요청 URL
        method: "PATCH",
        data: null,
      })
        .then((res) => {
          handleClose();
          setUserImage(res.data.profileImage);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  return (
    <Dialog onClose={handleClose} open={open} onChange={handleImageSelect}>
      <DialogTitle>select Image..</DialogTitle>
      <List sx={{ pt: 0 }}>
        <input type="file" id="fileInput" />
      </List>
      <DialogActions>
        <Button onClick={handleSubmit}>save</Button>
      </DialogActions>
    </Dialog>
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
          if (regex(setName, 10)) {
            alert("특수문자가 포함되어 있거나 잘못된 이름입니다");
          } else {
            axios
              .patch("/server/api/user", {
                username: setName.trim(),
              })
              .then((res) => {
                setNameDialogOpen(false);
                const loginUser = {
                  id: res.data.id,
                  username: setName.trim(),
                  jwt: accessToken,
                };
                window.localStorage.setItem(
                  "loginUser",
                  JSON.stringify(loginUser)
                );
                router.push(`/profile/${setName}`);
                setSetName(setName.trim());
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
