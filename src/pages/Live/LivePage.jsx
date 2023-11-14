import React from "react";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faVideo,
  faMicrophoneSlash,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useNavigate, useParams } from "react-router-dom";
import Peer from "peerjs";
import { useSelector } from "react-redux";
import styles from "../../css/LivePage.module.css";
import ReadyTimer from "../Exercise/ReadyTimer";

// server 연결
const client = Stomp.over(() => {
  return new SockJS("http://52.78.0.53:8080/live");
});

export default function LivePage() {
  const { liveId, camera, audio } = useParams();

  const myInfo = useSelector((state) => state.userInfo);

  const [myMediaStream, setMyMediaStream] = useState();
  const [audioOn, setAudioOn] = useState(JSON.parse(audio));
  const [cameraOn, setCameraOn] = useState(JSON.parse(camera));
  const [myPeerId, setMyPeerId] = useState();
  const [myPeer, setMyPeer] = useState();
  // const [peers, setPeers] = useState([]);
  const [otherNickname, setOtherNickname] = useState("");
  const [routine, setRoutine] = useState();

  const myMedia = useRef();
  const otherMedia = useRef();
  // const othersMedia = useRef([]);

  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyMediaStream(stream);
        myMedia.current.srcObject = stream;

        stream.getAudioTracks().forEach((audio) => (audio.enabled = audioOn));

        stream.getVideoTracks().forEach((video) => (video.enabled = cameraOn));
      });

    let myPeerId;

    client.connect(
      {},
      () => {
        client.subscribe("/room/participate/" + liveId, (data) => {
          let nick = JSON.parse(data.body).nick;
          if (nick === undefined) {
            let call;
            if (myPeerId !== JSON.parse(data.body).sdp) {
              call = peer.call(
                JSON.parse(data.body).sdp,
                myMedia.current.srcObject
              );
              console.log("offer");
            }
            if (call) {
              call.on("stream", (stream) => {
                if (otherMedia.current) {
                  otherMedia.current.srcObject = stream;
                  console.log(`received answer`);
                  // othersMedia.current.push(otherMedia);
                  // setPeers((prev) => [
                  //   ...prev,
                  //   {
                  //     peerId: call.peer,
                  //     stream: stream,
                  //   },
                  // ]);
                }
              });
              call.on("close", () => {
                otherMedia.current.srcObject = null;
                console.log("someone leaved");
              });
            }

            // 새로운 참여자가 들어올 때마다 닉네임 요청
            // client.send(
            //   '/app/nick/' + liveId,
            //   {},
            //   JSON.stringify({
            //     nickReq: 1,
            //   })
            // );
          } else {
            if (myPeerId !== JSON.parse(data.body).sdp) {
              alert(`${nick}님이 퇴장하셨습니다.`);
            }
          }
        });

        const peer = new Peer();
        setMyPeer(peer);
        peer.on("open", (peerId) => {
          myPeerId = peerId;
          setMyPeerId(peerId);
          client.send(
            "/app/participate/" + liveId,
            {},
            JSON.stringify({
              sdp: peerId,
            })
          );
        });

        peer.on("call", (call) => {
          call.answer(myMedia.current.srcObject);
          console.log("answer");
          call.on("stream", (stream) => {
            if (otherMedia.current) {
              otherMedia.current.srcObject = stream;
              console.log(`received offer`);
              // othersMedia.current.push(othersMedia);
              // setPeers((prev) => [
              //   ...prev,
              //   {
              //     peerId: call.peer,
              //     stream: stream,
              //   },
              // ]);
            }
          });
          call.on("close", () => {
            otherMedia.current.srcObject = null;
            console.log("someone leaved");
          });
        });

        client.subscribe("/room/routine/" + liveId, (data) => {
          console.log(JSON.parse(data.body));
          setRoutine(JSON.parse(data.body));
        });

        client.send(
          "/app/start/" + liveId,
          {},
          JSON.stringify({
            routineReq: 1,
          })
        );
      },
      () => {
        console.log("error occured");
      }
    );
  }, []);

  const handleAudio = () => {
    myMediaStream
      .getAudioTracks()
      .forEach((audio) => (audio.enabled = !audio.enabled));
    audioOn ? setAudioOn(false) : setAudioOn(true);
  };

  const handleCamera = () => {
    myMediaStream
      .getVideoTracks()
      .forEach((video) => (video.enabled = !video.enabled));
    cameraOn ? setCameraOn(false) : setCameraOn(true);
  };

  const handleExit = () => {
    client.send(
      "/app/participate/" + liveId,
      {},
      JSON.stringify({
        sdp: myPeerId,
        nick: myInfo.nickname,
      })
    );
    myPeer.destroy();
    client.disconnect();
    navigate("/");
  };

  const handleStart = () => {
    client.subscribe("/room/ready/" + liveId, (data) => {
      console.log(JSON.parse(data.body));
    });

    client.send(
      "/app/ready/" + liveId,
      {},
      JSON.stringify({
        time: 5,
      })
    );
  };

  return (
    <div>
      <div className={styles.left}>
        <div>
          <video
            playsInline
            ref={myMedia}
            autoPlay
            style={{ width: "400px", height: "400px" }}
          />
          <div>{myInfo.nickname}</div>
        </div>
        <button onClick={() => handleAudio()}>
          {audioOn ? (
            <FontAwesomeIcon icon={faMicrophone} />
          ) : (
            <FontAwesomeIcon icon={faMicrophoneSlash} />
          )}
        </button>
        <button onClick={() => handleCamera()}>
          {cameraOn ? (
            <FontAwesomeIcon icon={faVideo} />
          ) : (
            <FontAwesomeIcon icon={faVideoSlash} />
          )}
        </button>
        <div>
          <video
            playsInline
            ref={otherMedia}
            autoPlay
            style={{ width: "400px", height: "400px" }}
          />
          <div>{otherNickname}</div>
        </div>

        <button onClick={handleExit}>나가기</button>
      </div>
      <div className={styles.right}>
        <div>{routine?.name}</div>
        <div className={styles.cates}>
          {routine?.cate.map((item, index) => (
            <span key={index} className={styles.actionCate}>
              #{item}
            </span>
          ))}
        </div>
        <div>
          {routine?.routineDetails?.map((detail) =>
            detail.type ? (
              <div key={detail.ex.id} className={styles.timer}>
                <span className={styles.detailname}> {detail.ex?.name}</span>
                <span> {detail.time}s</span>
                <div>
                  <span>rest</span>
                  <span> {detail.rest}s</span>
                </div>
                <div>
                  <span>{detail.set} set</span>
                </div>
              </div>
            ) : (
              <div key={detail.ex.id} className={styles.timer}>
                <span className={styles.detailname}> {detail.ex?.name}</span>
                <span>{detail.count}개</span>
                <div>
                  <span>rest</span>
                  <span> {detail.rest}s</span>
                </div>
                <div>
                  <span>{detail.set} set</span>
                </div>
              </div>
            )
          )}
        </div>
        <button onClick={handleStart}>START</button>
      </div>
      {/* {peers.map((peer) => (
        <div>
          <video
            playsInline
            ref={(e) => (e.srcObject = peer.stream)}
            autolay
            style={{ width: '400px', height: '400px' }}
          />
        </div>
      ))} */}
    </div>
  );
}
