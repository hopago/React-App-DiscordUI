import './postCard.scss';
import ReactionButtons from '../reactionButtons/ReactionButtons';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectPostById } from '../../../../../../../features/post/slice/postsApiSlice';

const PostCard = ({ postId }) => {
  const post = useSelector(state => selectPostById(state, postId));

  return (
    <Link to={`/community/forum/${post._id}`}>
      <div className="forum-postCard-wrapper">
        <div className="img">
          <img src={post.imgUrl} alt="" />
        </div>
        <div className="texts">
          <h1>{post.title}</h1>
          <p>{post.desc.substring(0, 50)}...</p>
          <ReactionButtons post={post} />
        </div>
      </div>
    </Link>
  );
}

export default PostCard
