document.addEventListener('DOMContentLoaded', () => {
  const friendsListContainer = document.getElementById('friends-list');
  const friendRequestsContainer = document.getElementById('friend-requests');

  // Function to fetch and display friend requests
  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('api/get_friends.php?status=pending');
      const data = await response.json();

      if (data.success) {
        friendRequestsContainer.innerHTML = ''; // Clear existing content
        if (data.friends.length > 0) {
          data.friends.forEach(friend => {
            const friendRequestDiv = document.createElement('div');
            friendRequestDiv.classList.add('friend-request');
            friendRequestDiv.innerHTML = `
              <img src="${friend.profile_picture ? friend.profile_picture : 'assets/images/default.png'}" alt="${friend.username}" width="50">
              <span>${friend.username}</span>
              <button class="accept-friend" data-user-id="${friend.id}">Accept</button>
              <button class="reject-friend" data-user-id="${friend.id}">Reject</button>
            `;
            friendRequestsContainer.appendChild(friendRequestDiv);
          });

          // Add event listeners to accept and reject buttons
          document.querySelectorAll('.accept-friend').forEach(button => {
            button.addEventListener('click', handleAcceptFriend);
          });

          document.querySelectorAll('.reject-friend').forEach(button => {
            button.addEventListener('click', handleRejectFriend);
          });
        } else {
          friendRequestsContainer.innerHTML = '<p>No friend requests.</p>';
        }
      } else {
        friendRequestsContainer.innerHTML = `<p>Error fetching friend requests: ${data.message}</p>`;
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      friendRequestsContainer.innerHTML = '<p>Error fetching friend requests.</p>';
    }
  };

  // Function to fetch and display friends list
  const fetchFriendsList = async () => {
    try {
      const response = await fetch('api/get_friends.php?status=accepted');
      const data = await response.json();

      if (data.success) {
        friendsListContainer.innerHTML = ''; // Clear existing content
        if (data.friends.length > 0) {
          data.friends.forEach(friend => {
            const friendDiv = document.createElement('div');
            friendDiv.classList.add('friend');
            friendDiv.innerHTML = `
              <img src="${friend.profile_picture ? friend.profile_picture : 'assets/images/default.png'}" alt="${friend.username}" width="50">
              <span>${friend.username}</span>
            `;
            friendsListContainer.appendChild(friendDiv);
          });
        } else {
          friendsListContainer.innerHTML = '<p>No friends yet.</p>';
        }
      } else {
        friendsListContainer.innerHTML = `<p>Error fetching friends: ${data.message}</p>`;
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      friendsListContainer.innerHTML = '<p>Error fetching friends.</p>';
    }
  };

  // Function to handle accepting a friend request
  const handleAcceptFriend = async (event) => {
    const userId = event.target.dataset.user-id;

    try {
      const response = await fetch('api/accept_friend.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `user_id=${userId}`
      });

      const data = await response.json();

      if (data.success) {
        // Refresh friend requests and friends list
        fetchFriendRequests();
        fetchFriendsList();
      } else {
        alert(`Error accepting friend request: ${data.message}`);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Error accepting friend request.');
    }
  };

  // Function to handle rejecting a friend request
  const handleRejectFriend = async (event) => {
    const userId = event.target.dataset.user-id;

    try {
      const response = await fetch('api/reject_friend.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `user_id=${userId}`
      });

      const data = await response.json();

      if (data.success) {
        // Refresh friend requests and friends list
        fetchFriendRequests();
        fetchFriendsList();
      } else {
        alert(`Error rejecting friend request: ${data.message}`);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Error rejecting friend request.');
    }
  };

  // Initial load
  fetchFriendRequests();
  fetchFriendsList();
});