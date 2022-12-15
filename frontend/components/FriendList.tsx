import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getLoginUser } from "../lib/login";

export default function FriendList({ friendships }: any) {
  const router = useRouter();
  const [loginUser, setLoginUser]: any = useState(null);

  useEffect(() => {
    setLoginUser(getLoginUser());
  }, []);

  if (!loginUser) friendships = [];

  return (
    <List>
      {friendships.map((friendship: any) => {
        const friendName =
          loginUser.username === friendship.userId.username
            ? friendship.userFriendId.username
            : friendship.userId.username;

        return (
          <ListItemButton
            key={friendship.id}
            onClick={() => {
              router.push(`/profile/${friendName}`);
            }}
          >
            <ListItemAvatar>
              <Avatar>P</Avatar>
            </ListItemAvatar>
            <ListItemText primary={friendName} />
          </ListItemButton>
        );
      })}
    </List>
  );
}
