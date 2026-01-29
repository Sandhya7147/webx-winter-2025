import { useState} from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function Comment({comment, canDelete, onDeleteSuccess}){
	
    const [isModalDeleteComment, setIsModalDeleteComment] = useState(false);
    const [isLoadingDeleteComment, setIsLoadingDeleteComment] = useState(false);
	
    async function handleDeleteConfirm(){

		try{
            setIsLoadingDeleteComment(true);
			const token=localStorage.getItem('jwttoken');
            
			const response= await fetch(`${BASE_URL}/comment/delete/${comment.id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`); 
            }
            
            setIsModalDeleteComment(false);
            onDeleteSuccess();

		} catch(error){
			console.error(error);
		}finally{
			setIsLoadingDeleteComment(false);
		}
    
	}
    
    return(
		<div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            
            <div className="flex gap-4">
                <img 
                    src={comment.profile_pic} 
                    alt={comment.username} 
                    className="w-11 h-11 rounded-full object-cover border border-gray-100"
                />
                <div className="flex flex-col justify-center h-11">
                    <p className="font-bold text-gray-800 mb-1">{comment.username}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
                <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold">{new Date(comment.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
            </div>
            <br />
    	    <p className="text-gray-700 leading-relaxed mb-4">{comment.comment_text}</p>

            {canDelete && (
                <button 
                    onClick={() => {
                        setIsModalDeleteComment(true);
                    }}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                    title="Delete your comment"
                >
                🗑️
                </button>
            )}

            {isModalDeleteComment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                                        
                    <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
                        <h3 className="font-bold mb-4">Confirm Delete?</h3>

                            <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
                                <button 
                                    onClick={()=>{handleDeleteConfirm();}}
                                    disabled={isLoadingDeleteComment}
                                    className="w-full sm:w-32 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                                >
                                    {isLoadingDeleteComment ? "..." : "Delete"}
                                </button>
                                                
                                <button 
                                    onClick={() => { setIsModalDeleteComment(false);}}
                                    className="w-full sm:w-32 py-3 text-gray-300 bg-red-500 hover:bg-red-300 hover:text-gray-950 rounded-xl font-medium transition-colors"
                                    >Cancel
                                </button>
                            </div>
                    </div>
                </div>
            )}
	    </div>
	)
}

function CommentDisplay({comments,commentLoading, userComments, refreshComments}){
	
    return(
		<div className="mt-6 space-y-3">
            
            {commentLoading ? (
                <p className="text-gray-400">Loading comments...</p>
            ) : comments.length > 0 ? (

                comments.map((item) => (
                    <Comment 
                        key={item.id} 
                        comment={item}
                        canDelete={userComments.includes(item.id)}
                        onDeleteSuccess={refreshComments} 
                    />
                ))
            ) : (
                <p className="text-gray-400 text-sm italic">No comments yet. Be the first!</p>
            )}
        </div>
    )
}

export default CommentDisplay;