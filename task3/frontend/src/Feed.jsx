import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import 'katex/dist/katex.min.css';

import Profile from './Profile.jsx';
import Post from './Post.jsx';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TailwindComponents = {
  
  h1: ({children}) => <h1 className="text-4xl font-bold mb-4 mt-6">{children}</h1>,
  h2: ({children}) => <h2 className="text-2xl font-semibold mb-3 mt-5">{children}</h2>,
  p: ({children}) => <p className="mb-4 leading-relaxed text-gray-800">{children}</p>,
  ul: ({children}) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
  li: ({children}) => <li className="mb-1">{children}</li>,
  code: ({children}) => <code className="bg-gray-100 p-1 rounded text-red-500 font-mono">{children}</code>,
  strong: ({children}) => <strong className="font-bold text-black">{children}</strong>
};

function Feed() {
    const [posts, setPosts] = useState([]);
    const [userPosts, setUserPosts] = useState([]); 
    const [likes, setLikes] = useState([]);

    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalDeletePost, setIsModalDeletePost] = useState(false);
    const [isLoadingDeletePost, setIsLoadingDeletePost] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    useEffect(() => {
        getPosts();
        getLikes();
        getUserPosts();
    }, []);

    async function getPosts(){
		try{
			const token=localStorage.getItem('jwttoken');
			const response= await fetch(`${BASE_URL}/feed/get`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
                
            }
			const result = await response.json();
			console.log(`inside getPosts ${result}`);
            setPosts(result);
            if (selectedPost) {
                const updatedPost = result.find(p => p.id === selectedPost.id);
                if (updatedPost) {
                    setSelectedPost(updatedPost);
                }
            }
		} catch(error){
			console.error(error);
		}
	}
    async function getUserPosts(){
		try{
			const token=localStorage.getItem('jwttoken');
			const response= await fetch(`${BASE_URL}/user/posts/get`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
                
            }
			const result = await response.json();
			console.log(`inside getUserPosts ${result}`);
            setUserPosts(result);
		} catch(error){
			console.error(error);
		}
	}

    
    async function updateLikeCount(post_id){

		try{
			const token=localStorage.getItem('jwttoken');
            let action;
            if(likes.includes(post_id)){
                action='DELETE';
            }
            else{
                action='POST';
            }
			const response= await fetch(`${BASE_URL}/likecount/${action}/${post_id}`, {
				method: action,
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`); 
            }
            else{
                getPosts();
                getLikes();
                getUserPosts();
            }

			const result = await response.json();
			console.log(`inside updateLikeCount ${result}`);
		} catch(error){
			console.error(error);
		}finally{
			//disabel button
		}
    
	}
    async function getLikes(){
        setLikes([]);
		try{
			const token=localStorage.getItem('jwttoken');
			const response= await fetch(`${BASE_URL}/user/likes/get`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}
			const result = await response.json();
            
			console.log(`inside getLikes ${result}`);
            setLikes(result.map(l => l.post_id));
		} catch(error){
			console.error(error);
		}    
	}
    async function handleDeleteConfirm(post_id){

		try{
            setIsLoadingDeletePost(true);
			const token=localStorage.getItem('jwttoken');
            
			const response= await fetch(`${BASE_URL}/post/delete/${post_id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`); 
            }
            else{
                getPosts();
                getLikes();
                getUserPosts();
            }
            setIsModalDeletePost(false);
            setPostToDelete(null);

		} catch(error){
			console.error(error);
		}finally{
			setIsLoadingDeletePost(false);
		}
    
	}
  return (
    <>
        <Profile 
            onPostSuccess={() => {
                getPosts();
                getLikes();
                getUserPosts();
            }} 
        />
        <div className="max-w-4xl mx-auto p-4">

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Feed</h2>


                {selectedPost ? (
                    <Post 
                        post={selectedPost} 
                        likes={likes}
                        getLikes={getLikes}
                        updateLikeCount={updateLikeCount} 
                        onBack={() => setSelectedPost(null)} 
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {posts.length > 0 ? (
                        posts.map((post) => (
                    
                            <div 
                            key={post.id} 
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow"
                            >
                                <div className="cursor-pointer" onClick={()=>{setSelectedPost(post)}}>
                                    <div className="flex items-center gap-3 mb-3">
                                    
                                    <img 
                                        src={post.profile_pic} 
                                        alt="Profile" 
                                        className="w-16 h-16 rounded-full aspect-square object-cover ring-2 ring-blue-500"
                                    />
                                    {/*
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {post.username?.charAt(0).toUpperCase()}
                                    </div>*/}
                                    <p className="font-bold text-gray-800">{post.username}</p>
                                    </div>


                                    <div className="max-w-4xl mx-auto my-8 px-4">
                                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                            {post.blog_title}
                                        </h1>
                                        <div className="mt-4 flex items-center gap-4">
                                            <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold">{new Date(post.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                    <ReactMarkdown 
                                        components={TailwindComponents}
                                        remarkPlugins={[remarkMath]} 
                                        rehypePlugins={[rehypeKatex]}>
                                        {post.content}
                                    </ReactMarkdown>
                                    </p>
                                </div>

                            
                                <div className="mt-auto">
                                    <div className="flex items-center gap-4 border-y border-gray-50 py-2 mb-4">
                                        
                                        <button 
                                            onClick={() => updateLikeCount(post.id)} 
                                            className="flex items-center gap-1 hover:scale-110 transition text-gray-600 hover:text-red-500"
                                        >
                                            <span className={likes.includes(post.id) ? "brightness-110" : "grayscale"}>
                                                👍
                                            </span>
                                            <span className="text-sm font-semibold">{post.like_count}</span>
                                        </button>

                                        {userPosts.some(userPost => userPost.id === post.id) && (
                                            <button 
                                                onClick={() => {
                                                    setIsModalDeletePost(true);
                                                    setPostToDelete(post.id);
                                                }}
                                                className="p-2 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                                                title="Delete your post"
                                            >
                                                🗑️
                                            </button>
                                        )}

                                    </div>
                                    
                                </div>
                                

                            </div>
                            
                        ))
                        ) : (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400">No posts yet. Be the first to share something!</p>
                        </div>)}
                    </div>
                    )}
                    {isModalDeletePost && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                                        
                            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
                                <h3 className="font-bold mb-4">Confirm Delete?</h3>

                                    <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
                                        <button 
                                            onClick={()=>{handleDeleteConfirm(postToDelete);}}
                                            disabled={isLoadingDeletePost}
                                            className="w-full sm:w-32 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                                        >
                                            {isLoadingDeletePost ? "..." : "Delete"}
                                        </button>
                                                
                                        <button 
                                            onClick={() => { setIsModalDeletePost(false);}}
                                            className="w-full sm:w-32 py-3 text-gray-300 bg-red-500 hover:bg-red-300 hover:text-gray-950 rounded-xl font-medium transition-colors"
                                            >Cancel
                                        </button>
                                    </div>
                            </div>
                        </div>
                    )}
                        
        </div>
    </>
    
  );
}
export default Feed;