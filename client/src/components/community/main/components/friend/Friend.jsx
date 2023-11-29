import "./scss/friend.scss";
import {
  Group,
  MapsUgc,
  Help,
  Notifications,
  Search,
} from "@mui/icons-material";
import defaultProfile from "../../assets/default-profile-pic-e1513291410505.jpg";
import { useEffect, useState } from "react";
import UserInfo from "./components/UserInfo";
import {
  useLazyFindUserByIdQuery,
  useLazyGetAllFriendsQuery,
} from "../../../../../features/users/slice/usersApiSlice";
import {
  useGetReceivedCountQuery,
  useLazyGetAllFriendRequestQuery,
} from "../../../../../features/friends/slice/friendRequestApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../features/users/slice/userSlice";
import { socket } from "../../../../..";
import SendFriendForm from "./components/SendFriendForm";

const Friend = () => {
  const currentUser = useSelector(selectCurrentUser);

  const [getAllFriends] = useLazyGetAllFriendsQuery();
  const [getAllFriendRequest] = useLazyGetAllFriendRequestQuery();
  const { data: receivedCount } = useGetReceivedCountQuery();
  const [findUser] = useLazyFindUserByIdQuery();

  const [active, setActive] = useState(0);
  const [friends, setFriends] = useState(null);
  const [friendList, setFriendList] = useState(null);
  const [fetchType, setFetchType] = useState("온라인");
  const [showSendFriendForm, setShowFriendForm] = useState(false);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [contentType, setContentType] = useState("");

  const resetFetchState = () => {
    setContentType("");
    setFriends(null);
    setFriendList(null);
  };

  const fetchOnlineFriends = (e) => {
    resetFetchState();
    handleActiveClass(e);
    socket?.emit("getOnlineFriends", currentUser?._id);
    socket?.on("onlineFriendList", (onlineFriends) => {
      setFriends(onlineFriends);
    });
  };

  const fetchAllFriends = (e) => {
    resetFetchState();
    handleActiveClass(e);
    getAllFriends(currentUser?._id)
      .unwrap()
      .then((data) => setFriends(data))
      .catch((err) => console.error(err));
  };

  const fetchFriendRequest = (e) => {
    setContentType("friendRequest");
    setFriends(null);
    setFriendList(null);
    handleActiveClass(e);
    getAllFriendRequest()
      .unwrap()
      .then((data) =>
        setFriends(
          ...data.map((request) => request.members.map((friend) => friend))
        )
      )
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (Array.isArray(friends) && friends.length) {
      setFriendList(
        <>
          {friends?.map((friend) => (
            <UserInfo
              type={contentType}
              senderId={friend._id}
              key={friend._id}
              defaultProfile={defaultProfile}
              friend={friend}
            />
          ))}
        </>
      );
    }
  }, [friends, active]);

  useEffect(() => {
    if (receivedCount?.count) {
      setFriendRequestCount(receivedCount.count);
    }
  }, [receivedCount]);

  useEffect(() => {
    try {
      socket?.emit("activateUser", currentUser);
      socket?.emit("getOnlineFriends", currentUser?._id);
      socket?.on("onlineFriendList", (onlineFriends) => {
        if (!onlineFriends) return;
        setFriends(onlineFriends);
      });
    } catch (err) {
      console.error(err);
    }

    return () => {
      socket?.off("onlineFriendList");
    };
  }, [socket, currentUser]);

  useEffect(() => {
    socket?.on("getNotification", ({ senderId, requestType }) => {
      if (senderId && requestType === "FriendRequest") {
        findUser(senderId)
          .unwrap()
          .then((data) => setFriends((prev) => [...prev, data]))
          .catch((err) => console.error(err));

        setFriendRequestCount((prev) => prev + 1);
      }
    });

    return () => {
      socket?.off("getNotification");
    };
  }, [socket]);

  const handleActiveClass = (e) => {
    if (e.target.innerText === "온라인") {
      setActive(0);
      setFetchType("온라인");
    } else if (e.target.innerText === "모두") {
      setActive(1);
      setFetchType("모두");
    } else if (e.target.innerText === "대기 중") {
      setActive(2);
      setFetchType("대기 중");
    } else if (e.target.innerText === "차단 목록") {
      setActive(3);
      setFetchType("차단 목록");
    }
    setShowFriendForm(false);
  };

  const handleShowFriendForm = () => {
    setShowFriendForm(true);
    setActive(4);
  };

  return (
    <div className="friend">
      <section className="friend-option-container">
        <div className="wrapper">
          <div className="contents">
            <div className="friend-option-left">
              <div className="currentChannel">
                <Group style={{ color: "#80848E" }} className="friend-icon" />
                <span>친구</span>
              </div>
              <div className="fill" />
              <div className="routes">
                <div
                  className={
                    active === 0 ? "active friend-opt-list" : "friend-opt-list"
                  }
                  onClick={fetchOnlineFriends}
                >
                  온라인
                </div>
                <div
                  className={
                    active === 1 ? "active friend-opt-list" : "friend-opt-list"
                  }
                  onClick={fetchAllFriends}
                >
                  모두
                </div>
                <div
                  className={
                    active === 2
                      ? `active friend-opt-list ${
                          Number(friendRequestCount) > 0 &&
                          "friend-request-count"
                        }`
                      : `friend-opt-list ${
                          Number(friendRequestCount) > 0 &&
                          "friend-request-count"
                        }`
                  }
                  onClick={fetchFriendRequest}
                >
                  <span className="text">대기 중</span>
                  <div className="notifications">
                    <span className="badge">
                      {Number(friendRequestCount) > 0 && friendRequestCount}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    active === 3 ? "active friend-opt-list" : "friend-opt-list"
                  }
                  onClick={() => {}}
                >
                  차단 목록
                </div>
                <div
                  className={
                    active === 4
                      ? "friend-opt-list last-child active"
                      : "friend-opt-list last-child"
                  }
                  onClick={handleShowFriendForm}
                >
                  친구 추가하기
                </div>
              </div>
            </div>
            <div className="friend-option-right">
              <div className="addConversation">
                <MapsUgc />
              </div>
              <div className="fill" />
              <div className="icons">
                <div className="icon">
                  <Notifications />
                </div>
                <div className="icon">
                  <Help />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <hr />
      <div className="friend-body">
        <div className="body-left">
          {showSendFriendForm ? (
            <SendFriendForm currentUser={currentUser} />
          ) : (
            <>
              <div className="friend-searchBar">
                <div className="wrapper">
                  <div className="innerForm">
                    <form>
                      <input type="text" placeholder="검색하기" />
                    </form>
                  </div>
                  <div className="icon">
                    <Search />
                  </div>
                </div>
              </div>
              <div className="section-title">
                <span>{fetchType}</span>
              </div>
              <div className="friendList-col">{friendList && friendList}</div>
            </>
          )}
        </div>
        <div className="body-right">
          <div className="wrapper">
            <h2>친한 친구</h2>
            <div className="body-right-itemCard">
              {/* fetch */}
              <div className="listItem-wrapper">
                <div className="listItem">
                  <img src={defaultProfile} alt="" />
                  <div className="body-right-userInfo">
                    <span className="body-right-userInfo-userName">
                      UserName
                    </span>
                    <span className="body-right-userInfo-userRole">
                      UserRole
                    </span>
                  </div>
                  <div className="roleIcon">
                    <img
                      src="https://w7.pngwing.com/pngs/79/518/png-transparent-js-react-js-logo-react-react-native-logos-icon.png"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friend;
