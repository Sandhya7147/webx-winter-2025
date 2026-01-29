import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import 'katex/dist/katex.min.css';
import CommentDisplay from './Comment.jsx';

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

function Post({ post, likes, getLikes, updateLikeCount, onBack }) {
    
    const [isModalCommentOpen, setIsModalCommentOpen] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [isLoadingMakeComment, setIsLoadingMakeComment] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [userComments, setUserComments] = useState([]);

    if (!post) return <p>Post not found...</p>;

    useEffect(() => {
        if (post) {
            getLikes();
            getComments();
            getUserComments();
        }
    }, [post?.id]);

    async function getComments(){

		if (!post?.id) return;
		setCommentLoading(true);
		try{
			const token=localStorage.getItem('jwttoken');
			const response= await fetch(`${BASE_URL}/comments/get/${post.id}`, {
				method: 'GET',
				headers: {
        			'Authorization': `Bearer ${token}`
    			}
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}
			
			const result = await response.json();
			console.log("inside getComments", result);
			setComments(result);
	
		} catch(error){
			console.error(error);
		}finally{
			setCommentLoading(false);
		}		
	}

    async function getUserComments(){
        if (!post?.id) return;

		try{
			const token=localStorage.getItem('jwttoken');
			const response= await fetch(`${BASE_URL}/user/comments/get`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
                
            }
			const result = await response.json();
			console.log(`inside getUserComments ${result}`);
            setUserComments(result.map(c => c.id));
		} catch(error){
			console.error(error);
		}
	}

    async function handleCommentSubmit(){
        setIsLoadingMakeComment(true);
        try{
            const token=localStorage.getItem('jwttoken');
            const response= await fetch(`${BASE_URL}/makecomment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                content: commentContent,
                post_id: post.id
                }) 
            })

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
       
        
            const result = await response.json();
            console.log(`inside handleCommentSubmit ${result}`);
            setCommentContent("");
            setIsModalCommentOpen(false);      
            getComments();
            getUserComments();

            //t
            if (onCommentSuccess) {
                onCommentSuccess();
            }
        } catch(error){
            console.error(error);
        } finally{
            setIsLoadingMakeComment(false);
        }
    }
    
    return (
        <div className="animate-in fade-in duration-300">
            <button 
                onClick={onBack}
                className="mb-4 text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
                ← Back to Feed
            </button>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            
                <div className="flex items-center gap-4 mb-6">
                    <img 
                        src={post.profile_pic} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full aspect-square object-cover ring-2 ring-blue-500"
                    />
                    {/*
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                        {post.username?.charAt(0).toUpperCase()}
                    </div>
                    */}
                    <h2 className="text-2xl font-bold">{post.username}</h2>
                </div>

                <div className="max-w-4xl mx-auto my-8 px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        {post.blog_title}
                    </h1>
                    <div className="mt-4 flex items-center gap-4">
                        <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold">{new Date(post.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                </div>
                <p className="text-xl text-gray-800 mb-8 leading-relaxed">
                    <ReactMarkdown 
                        components={TailwindComponents}
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}>
                        {post.content}
                    </ReactMarkdown>
                </p>


                <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                    <button 
                        onClick={() =>{updateLikeCount(post.id)} } 
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 group"
                    >
                        <span className={`text-2xl transition-all ${likes.includes(post.id) ? "scale-110" : "grayscale opacity-70 group-hover:opacity-100"}`}>
                            👍
                        </span>
                        <span className={`font-bold ${likes.includes(post.id) ? "text-blue-600" : "text-gray-600"}`}>
                            {post.like_count || 0}
                        </span>
                    </button>
                     <button 
                            onClick={() => setIsModalCommentOpen(true)}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-lg"
                            >
                            Comment
                    </button>
                    {isModalCommentOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                            
                            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
                            
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-extrabold text-gray-800">Add Comment</h2>
                                <button onClick={() => setIsModalCommentOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                            </div>
                            
                            <textarea 
                                className="w-full h-48 sm:h-40 border-none bg-gray-50 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-800 text-lg"
                                placeholder="What's your view?"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                            />

                            <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
                                <button 
                                onClick={handleCommentSubmit}
                                disabled={isLoadingMakeComment}
                                className="w-full sm:w-32 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                                >
                                {isLoadingMakeComment ? "..." : "Post"}
                                </button>
                                
                                <button 
                                onClick={() => { setIsModalCommentOpen(false); setCommentContent(""); }}
                                className="w-full sm:w-32 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >Cancel</button>
                            </div>
                            </div>
                        </div>
                    )}
                </div>

                 <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Comments</h3>
                    <CommentDisplay 
                        comments={comments}
                        loading={commentLoading}
                        userComments={userComments}
                        refreshComments={getComments}
                    />
                </div>
            </div>
        </div>
    );
        
}

export default Post;