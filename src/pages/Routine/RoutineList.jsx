import React from 'react';
import { useState, useEffect } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../css/RoutineList.module.css';

export default function RoutineList() {
  const [routinedata, setRoutindata] = useState(null); //루틴 데이터 받아오기
  const [loading, setLoading] = useState(false); //
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState(''); //검색

  const navigate = useNavigate();

  const SearchValue = (event) => {
    setSearchInput(event.target.value);
    //console.log(event.target.value);
  };

  //const [showPopup, setShowPopup] = useState(false); //루틴 선택시 팝업창

  const onClickSearch = () => {
    let sArray = routinedata.result.routines.filter(
      (search) =>
        search.routine.subject.includes(searchInput) ||
        search.cate.includes(searchInput)
    );

    console.log(sArray);

    //console.log(searchArray);
    navigate('/routineSearch', { state: { sArray } });
    //검색관리
  };

  const onPress = (e) => {
    if (e.key === 'Enter') {
      let sArray = routinedata.result.routines.filter(
        (search) =>
          search.routine.subject.includes(searchInput) ||
          search.cate.includes(searchInput)
      );

      console.log(sArray);

      //console.log(searchArray);
      navigate('/routineSearch', { state: { sArray } });
    }
  };

  const onPopup = (id) => {
    //팝업 관리
    const width = 500;
    const height = 700;
    const x = window.outerWidth / 2 - width / 2;
    const y = window.outerHeight / 2 - height / 2;

    const url = `/routinedetail/${id}`;
    window.open(
      url,
      'window_name',
      `width=${width},height=${height},location=no,status=no,scrollbars=yes,top=${y},left=${x}`
    );

    //navigate(`/routinedetail/${id}`, { state: { id } });
  };

  const fetchroutine = async () => {
    try {
      setRoutindata(null);
      setLoading(true);
      setError(null);

      const response = await axios.get(
        'http://52.78.0.53/api/ex-routines?type=false'
      );
      setRoutindata(response.data);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchroutine();
  }, []);

  console.log(routinedata);

  if (loading) return <div>로딩중..</div>;
  if (error) return <div>에러발생</div>;
  if (!routinedata) return <div>null</div>;

  return (
    <div className={styles.header}>
      <div className={styles.Routine}>Routine</div>
      <hr />

      <div className={styles.SearchandSort}>
        <div className={styles.searchContainer}>
          <input
            type='text'
            className={styles.routinesearch}
            placeholder='Search'
            value={searchInput}
            onChange={SearchValue}
            onKeyPress={onPress}
          />
          <button className={styles.searchButton} onClick={onClickSearch}>
            <AiOutlineSearch />
          </button>
        </div>
      </div>
      <div className={styles.RoutineListarr}>
        {routinedata.result.routines.map((routine) => (
          <button
            key={routine.routine.id}
            type='button'
            className={styles.routineClick}
            onClick={() => onPopup(routine.routine.id)}
          >
            <div className={styles.RoutineListItem}>
              <div className={styles.subject}>{routine.routine.subject}</div>
              <div className={styles.catesHits}>
                <div className={styles.cates}>
                  {routine.cate.map((item, index) => (
                    <span key={index} className={styles.actionCate}>
                      #{item}
                    </span>
                  ))}
                </div>
                <span className={styles.hits}>
                  조회수: {routine.routine.hits}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
