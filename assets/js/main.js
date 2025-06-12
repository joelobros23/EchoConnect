document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('post-form');
    const postsContainer = document.getElementById('posts-container');

    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const content = document.getElementById('post-content').value;
            const image = document.getElementById('post-image').files[0]; // Get the file

            const formData = new FormData();
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            try {
                const response = await fetch('api/create_post.php', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token') // Include token if needed
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Post created:', data);
                    postForm.reset(); // Clear the form
                    fetchPosts(); // Refresh posts
                } else {
                    console.error('Error creating post:', data);
                    alert(data.message || 'Failed to create post.');
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Network error occurred.');
            }
        });
    }

    async function fetchPosts() {
        try {
            const response = await fetch('api/get_posts.php', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token') // Include token if needed
                }
            });

            const data = await response.json();

            if (response.ok) {
                displayPosts(data);
            } else {
                console.error('Error fetching posts:', data);
                postsContainer.innerHTML = '<p>Error fetching posts.</p>';
            }
        } catch (error) {
            console.error('Network error:', error);
            postsContainer.innerHTML = '<p>Network error occurred.</p>';
        }
    }

    function displayPosts(posts) {
        postsContainer.innerHTML = ''; // Clear existing posts

        posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.classList.add('post');

            let imageHtml = '';
            if (post.image_url) {
                imageHtml = `<img src="${post.image_url}" alt="Post Image" class="post-image">`;
            }

            postDiv.innerHTML = `
                <div class="post-header">
                    <a href="profile.html?id=${post.user_id}">
                        <img src="${post.profile_picture ? post.profile_picture : 'assets/images/default.png'}" alt="Profile Picture" class="profile-picture">
                    </a>
                    <div class="post-info">
                        <a href="profile.html?id=${post.user_id}">
                        <h3>${post.first_name} ${post.last_name}</h3>
                        </a>
                        <p class="post-date">${formatDate(post.created_at)}</p>
                    </div>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                    ${imageHtml}
                </div>
                <div class="post-actions">
                    <button class="like-button" data-post-id="${post.id}" data-liked="${post.is_liked}">
                        ${post.is_liked ? 'Unlike' : 'Like'} (${post.likes_count})
                    </button>
                    <button class="comment-button" data-post-id="${post.id}">Comment</button>
                </div>
                <div class="comments-section" id="comments-${post.id}">
                    <!-- Comments will be loaded here -->
                </div>
            `;

            postsContainer.appendChild(postDiv);

            // Attach event listeners to the dynamically created buttons
            const likeButton = postDiv.querySelector('.like-button');
            likeButton.addEventListener('click', () => handleLike(post.id, likeButton));

            const commentButton = postDiv.querySelector('.comment-button');
            commentButton.addEventListener('click', () => loadComments(post.id));
        });
    }

    async function handleLike(postId, button) {
        const isLiked = button.dataset.liked === '1';
        const endpoint = isLiked ? 'api/unlike_post.php' : 'api/like_post.php';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({ post_id: postId })
            });

            const data = await response.json();

            if (response.ok) {
                const newLikesCount = data.likes_count;
                button.textContent = isLiked ? `Like (${newLikesCount})` : `Unlike (${newLikesCount})`;
                button.dataset.liked = isLiked ? '0' : '1';
            } else {
                console.error('Error liking/unliking post:', data);
                alert(data.message || 'Failed to like/unlike post.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error occurred.');
        }
    }


    async function loadComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        commentsSection.innerHTML = '<p>Loading comments...</p>';

        try {
            const response = await fetch(`api/get_comments.php?post_id=${postId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            const data = await response.json();

            if (response.ok) {
                displayComments(postId, data);
            } else {
                console.error('Error fetching comments:', data);
                commentsSection.innerHTML = '<p>Error loading comments.</p>';
            }
        } catch (error) {
            console.error('Network error:', error);
            commentsSection.innerHTML = '<p>Network error occurred.</p>';
        }
    }

    function displayComments(postId, comments) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        commentsSection.innerHTML = '';

        if (comments.length === 0) {
            commentsSection.innerHTML = '<p>No comments yet.</p>';
            return;
        }

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');
            commentDiv.innerHTML = `
                <p><strong>${comment.first_name} ${comment.last_name}:</strong> ${comment.content}</p>
                <p class="comment-date">${formatDate(comment.created_at)}</p>
            `;
            commentsSection.appendChild(commentDiv);
        });

         //Add comment creation form
        const commentForm = document.createElement('form');
        commentForm.classList.add('comment-form');
        commentForm.innerHTML = `
            <textarea placeholder="Write a comment..." class="comment-input"></textarea>
            <button type="submit" class="comment-submit">Post Comment</button>
        `;
        commentsSection.appendChild(commentForm);

        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const commentInput = commentForm.querySelector('.comment-input');
            const commentContent = commentInput.value;

            if (!commentContent) {
                alert('Comment cannot be empty.');
                return;
            }

            try {
                const response = await fetch('api/create_comment.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({ post_id: postId, content: commentContent })
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Comment created:', data);
                    commentInput.value = ''; // Clear the input
                    loadComments(postId); // Refresh comments
                } else {
                    console.error('Error creating comment:', data);
                    alert(data.message || 'Failed to create comment.');
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Network error occurred.');
            }
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString(); // Adjust format as needed
    }


    // Initial fetch of posts when the page loads
    if(postsContainer){
         fetchPosts();
    }

});