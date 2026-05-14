import { useState, useEffect } from "react";
import api from "../api/axios";
import { MessageSquare, Heart, Image as ImageIcon, Send, Clock, UserCircle2, MapPin, X, UploadCloud } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Feed({ userCommunities }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostCommunity, setNewPostCommunity] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [newPostImageUrl, setNewPostImageUrl] = useState(""); // Fallback URL
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  const [commentInputs, setCommentInputs] = useState({});
  const [submittingCommentId, setSubmittingCommentId] = useState(null);

  const fetchPosts = async () => {
    if (!userCommunities || userCommunities.length === 0) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      let allPosts = [];
      
      for (const community of userCommunities) {
        try {
          const res = await api.get(`/posts/get?communityId=${community._id}`);
          if (res?.data?.posts) {
            allPosts = [...allPosts, ...res.data.posts];
          }
        } catch (fetchErr) {
          console.error(`Failed to fetch for community ${community._id}`, fetchErr);
        }
      }
      
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(allPosts);
    } catch (err) {
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (userCommunities && userCommunities.length > 0) {
      setNewPostCommunity(userCommunities[0]._id);
    }
  }, [userCommunities]);

  // Clean up Object URL
  useEffect(() => {
    if (newPostMedia && typeof newPostMedia !== "string") {
      const url = URL.createObjectURL(newPostMedia);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [newPostMedia]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !newPostCommunity) return;
    setSubmittingPost(true);

    try {
      let data;
      let headers = {};

      if (newPostMedia) {
        data = new FormData();
        data.append("communityId", newPostCommunity);
        data.append("content", newPostContent);
        data.append("media", newPostMedia);
        // Include fallback URL if provided somehow, but primarily priority goes to media
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        data = {
          communityId: newPostCommunity,
          content: newPostContent,
          imageUrl: newPostImageUrl
        };
      }

      const res = await api.post("/posts", data, { headers });
      
      setNewPostContent("");
      setNewPostMedia(null);
      setNewPostImageUrl("");
      setIsModalOpen(false);
      
      if (res?.data?.post) {
        setPosts((prev) => [res.data.post, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        fetchPosts();
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create post");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch (err) {
      alert("Failed to like post");
    }
  };

  const handleCommentChange = (postId, text) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: text }));
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;
    
    setSubmittingCommentId(postId);
    try {
      await api.post(`/posts/${postId}/comment`, { comment: commentText });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return new Date(dateString).toLocaleDateString();
    }
  };

  // Helper to resolve absolute URLs for uploaded static files
  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // Assuming backend runs on 5000, but checking API base URL if dynamically available
    const baseURL = api.defaults.baseURL.replace("/api", "");
    return `${baseURL}${url}`;
  };

  if (loading) return (
    <div className="flex w-full max-w-2xl mx-auto flex-col gap-6 items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />
      <p className="text-sm font-medium text-zinc-500 animate-pulse">Loading your community feed...</p>
    </div>
  );

  if (error) return (
    <div className="flex w-full max-w-2xl mx-auto items-center justify-center rounded-3xl border-2 border-dashed border-red-200 p-12 text-center bg-red-50/50">
      <p className="text-sm font-bold text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="flex w-full max-w-2xl mx-auto flex-col gap-6 pb-20">
      
      {/* Create Post Trigger */}
      {userCommunities?.length > 0 && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <UserCircle2 className="h-7 w-7" />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex h-12 flex-1 items-center rounded-full bg-zinc-100 px-5 text-left text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              Share an update with your community...
            </button>
          </div>
          <div className="mt-4 flex items-center justify-around border-t border-zinc-100 pt-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 transition-colors"
            >
              <ImageIcon className="h-5 w-5 text-emerald-500" />
              Photo / Video
            </button>
            <div className="w-[1px] h-8 bg-zinc-100" />
            <div className="flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed">
              Showing updates from {userCommunities.length} {userCommunities.length === 1 ? 'community' : 'communities'}
            </div>
          </div>
        </div>
      )}

      {/* Modal Overlay for Creating Post */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative border-b border-zinc-100 px-6 py-4 text-center">
              <h2 className="text-xl font-bold text-zinc-900">Create post</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2 text-zinc-500 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-6 flex flex-col gap-5">
              
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <UserCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">Post to Community</div>
                  <select
                    value={newPostCommunity}
                    onChange={(e) => setNewPostCommunity(e.target.value)}
                    className="mt-1 block w-auto appearance-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 outline-none hover:bg-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    required
                  >
                    {userCommunities.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What do you want to talk about?"
                className="w-full resize-none bg-transparent text-lg placeholder:text-zinc-400 outline-none min-h-[120px]"
                required
              />

              {previewUrl ? (
                <div className="relative group rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50">
                   <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-cover" />
                   <button 
                     type="button" 
                     onClick={() => { setNewPostMedia(null); setPreviewUrl(null); }}
                     className="absolute top-2 right-2 bg-zinc-900/60 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                   >
                      <X className="h-4 w-4" />
                   </button>
                </div>
              ) : newPostImageUrl ? (
                <div className="relative group rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50">
                   <img src={newPostImageUrl} alt="Preview fallback" className="w-full max-h-64 object-cover" />
                   <button 
                     type="button" 
                     onClick={() => setNewPostImageUrl("")}
                     className="absolute top-2 right-2 bg-zinc-900/60 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                   >
                      <X className="h-4 w-4" />
                   </button>
                </div>
              ) : null}

              {/* Upload Controls */}
              {!previewUrl && (
                <div className="rounded-2xl border border-zinc-200 p-2 shadow-sm flex flex-col gap-2 bg-zinc-50/50">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm font-semibold text-zinc-700 pl-1">Add to your post</span>
                    <label className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-emerald-500 hover:bg-emerald-50 cursor-pointer transition-colors">
                      <ImageIcon className="h-5 w-5" />
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewPostMedia(e.target.files[0]);
                            setNewPostImageUrl(""); // clear URL fallback when uploading file
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2 px-2 pb-2">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 w-8">OR</div>
                    <input
                      type="url"
                      value={newPostImageUrl}
                      onChange={(e) => setNewPostImageUrl(e.target.value)}
                      placeholder="Paste image URL directly..."
                      className="flex-1 rounded-xl bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-zinc-200 transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingPost || !newPostContent.trim()}
                className="w-full mt-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {submittingPost ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Posting...
                  </div>
                ) : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/50 text-indigo-500">
             <MessageSquare className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Your feed is quiet</h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-[280px]">
            Be the first to share an update, local news, or start a discussion with your communities!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <div key={post._id} className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md">
              
              {/* Post Header */}
              <div className="flex items-start justify-between p-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-inner">
                    {post.author?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-zinc-900 hover:underline cursor-pointer">
                      {post.author?.name || "Unknown User"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(post.createdAt)}</span>
                      <span>•</span>
                      <MapPin className="h-3 w-3 text-indigo-400" />
                      <span className="text-indigo-600 hover:underline cursor-pointer">{post.community?.name || "Community"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-5 pb-3 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800 font-medium">
                {post.content}
              </div>

              {/* Post Image */}
              {post.imageUrl && (
                <div className="px-2">
                  {resolveImageUrl(post.imageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={resolveImageUrl(post.imageUrl)}
                      controls
                      className="w-full max-h-[500px] rounded-2xl object-cover bg-zinc-950 border border-zinc-100"
                    />
                  ) : (
                    <img
                      src={resolveImageUrl(post.imageUrl)}
                      alt="Post attachment"
                      className="w-full max-h-[500px] rounded-2xl object-cover bg-zinc-50 border border-zinc-100"
                    />
                  )}
                </div>
              )}

              {/* Post Stats */}
              <div className="px-5 pt-4 pb-2 flex items-center justify-between text-xs font-medium text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white border-2 border-white">
                    <Heart className="h-2.5 w-2.5 fill-current" />
                  </div>
                  <span>{post.likes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                   <span>{post.comments?.length || 0} Comments</span>
                </div>
              </div>

              {/* Post Actions */}
              <div className="mx-5 mb-2 mt-1 flex items-center justify-between gap-1 border-y border-zinc-100 py-1">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-rose-600 active:scale-95"
                >
                  <Heart className="h-5 w-5" />
                  Like
                </button>
                <div className="w-[1px] h-6 bg-zinc-200/60" />
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-indigo-600 active:scale-95 cursor-auto"
                >
                  <MessageSquare className="h-5 w-5" />
                  Comment
                </button>
              </div>

              {/* Comments Section */}
              <div className="bg-zinc-50/50 px-5 py-4">
                
                {/* Existing Comments */}
                {post.comments?.length > 0 && (
                  <div className="mb-4 flex flex-col gap-3">
                    {post.comments.map((comment, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-xs">
                           {comment.user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex flex-col">
                          <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm border border-zinc-100 shadow-sm leading-relaxed">
                            <span className="font-bold text-zinc-900 mr-2">{comment.user?.name || "User"}</span>
                            <span className="text-zinc-700">{comment.text}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <form
                  onSubmit={(e) => handleCommentSubmit(e, post._id)}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post._id] || ""}
                      onChange={(e) => handleCommentChange(post._id, e.target.value)}
                      className="w-full rounded-full border border-zinc-200 bg-white pl-4 pr-10 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                    />
                    <button
                      type="submit"
                      disabled={submittingCommentId === post._id || !(commentInputs[post._id] || "").trim()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      {submittingCommentId === post._id ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
