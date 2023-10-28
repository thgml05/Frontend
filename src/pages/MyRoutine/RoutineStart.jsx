import React from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "../../css/Popup.module.css";
import { useNavigate } from "react-router-dom";

const RoutineStart = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const A = (id) => {
    navigate(`/start/${id}`, { state: { id } });
  };
  const Start = (id) => {
    window.opener.location.href = "/my/routine/list";
    window.close();
    A(id);
  };

  return (
    <>
      <div>루틴시작</div>
      <div>{id}</div>
      <button className={styles.backbutton} onClick={() => Start(id)}>
        Check
      </button>
    </>
  );
};

export default RoutineStart;
