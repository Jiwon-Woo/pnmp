import { socket } from "../login";
import { user_data } from "../login";
import axios from "axios";
import { Router, useRouter } from "next/router";
import React, { useEffect } from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import {
  frame,
  draw_score,
  twinkle,
  draw_p1_bar,
  draw_p2_bar,
  draw_ball,
  draw_countDown,
  draw_countDown2,
} from "./sketch.js";

let data = {
  is_player: -1,
  roomId: 0,
  H: 400,
  W: 700,
  UD_d: 0,
  bar_d: 50,
  countDown: -1,
  p1: {
    countDown: -1,
    mouse_y: 0,
    score: 0,
  },
  p2: {
    countDown: -1,
    mouse_y: 0,
    score: 0,
  },
  ball: {
    x: 0,
    y: 0,
    v_x: 0,
    v_y: 0,
  },
};

let gameRoomId;
let bar_loop: NodeJS.Timer;

export default function GameRoom() {
  const router = useRouter();
  const roomId = `${router.query.room_id}`;

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // use parent to render the canvas in this ref
    // (without that p5 will render the canvas outside of your component)
    p5.createCanvas(data.W, data.H).parent(canvasParentRef);
  };
  useEffect(() => {
    function routeChangeHandler() {
      socket.emit(`roomOut`, roomId);
    }
    socket.emit("comeInGameRoom", roomId);
    router.events.on("routeChangeStart", routeChangeHandler);
    socket.on(`countDown`, (count: number) => {
      console.log(count);
      data.countDown = count;
    });
    socket.on(`countDown1`, (count: number) => {
      console.log(`countDown1: ${count}`);
      data.p1.countDown = count;
      data.countDown = -1;
    });
    socket.on(`countDown2`, (count: number) => {
      console.log(`countDown2: ${count}`);
      data.countDown = -1;
      data.p2.countDown = count;
    });
    socket.on(`game[${roomId}]`, (_data) => {
      // console.log(`game[${roomId}]`);
      data.p1.countDown = -1;
      data.p2.countDown = -1;
      data = { ..._data };
    });
    
    socket.on('getOut!', async ()=>{
      dataInit();
      await router.push(`/clients`);
    });
    
    return ()=>{
      console.log(`hi? return`);
      router.events.off("routeChangeStart", routeChangeHandler);
      socket.off("comeInGameRoom");
      socket.off("countDown");
      socket.off(`countDown1`);
      socket.off(`countDown2`);
      socket.off(`game[${roomId}]`);
    }
  }, []);
  
  const draw = (p5: p5Types) => {
    p5.background(230);
    frame(p5, data);

    draw_score(p5, data);

    p5.fill("white");
    twinkle(p5);
    if (data.countDown >= 0) {
      draw_countDown(p5, data);
    } else {
      draw_countDown2(p5, data);
    }
    p5.fill('white');
    draw_p1_bar(p5, data);
    draw_p2_bar(p5, data);

    if (user_data.is_player == 1) {
      let send = {
        roomId: roomId,
        m_y: p5.mouseY,
      };
      socket.emit("racket", send);
    }

    if (data.ball.x != 0) draw_ball(p5, data);
  };
  return <Sketch setup={setup} draw={draw} />;
}

function dataInit() {
  data = {
    is_player: -1,
    roomId: 0,
    H: 400,
    W: 700,
    UD_d: 0,
    bar_d: 50,
    countDown: -1,
    p1: {
      countDown: -1,
      mouse_y: 0,
      score: 0,
    },
    p2: {
      countDown: -1,
      mouse_y: 0,
      score: 0,
    },
    ball: {
      x: 0,
      y: 0,
      v_x: 0,
      v_y: 0,
    },
  };
}
