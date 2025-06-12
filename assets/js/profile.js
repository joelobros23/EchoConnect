document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.getElementById('profile-container');
    const editProfileForm = document.getElementById('edit-profile-form');
    const profilePictureInput = document.getElementById('profile-picture');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const bioInput = document.getElementById('bio');
    const updateProfileButton = document.getElementById('update-profile-button');

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id'); // Get user ID from URL parameter, if any.  Otherwise, get the logged-in user.
    
    const fetchProfile = (userIdToFetch) => {
        let apiUrl = 'api/get_profile.php';
        if (userIdToFetch) {
            apiUrl += `?id=${userIdToFetch}`;
        }
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    profileContainer.innerHTML = `<p>${data.error}</p>`;
                    return;
                }

                const user = data;

                document.title = `EchoConnect - ${user.username}'s Profile`; // Update title

                let profileHTML = `
                    <div class="profile-header">
                        <img src="assets/images/${user.profile_picture}" alt="Profile Picture" class="profile-picture">
                        <h2>${user.first_name || ''} ${user.last_name || ''}</h2>
                        <p>@${user.username}</p>
                    </div>
                    <div class="profile-bio">
                        <p>${user.bio || 'No bio available.'}</p>
                    </div>
                `;

                profileContainer.innerHTML = profileHTML;

                // Pre-fill edit profile form if it exists and if the user is viewing their *own* profile
                if (editProfileForm && (!userIdToFetch)) { // Only show editing capabilities to the user if they are viewing their own profile
                    firstNameInput.value = user.first_name || '';
                    lastNameInput.value = user.last_name || '';
                    bioInput.value = user.bio || '';
                } else if (editProfileForm){
                    editProfileForm.style.display = 'none'; // Hide edit form if not the user's own profile
                }
            })
            .catch(error => {
                console.error('Error fetching profile:', error);
                profileContainer.innerHTML = '<p>Failed to load profile.</p>';
            });
    };


    if (updateProfileButton) {
        updateProfileButton.addEventListener('click', (e) => {
            e.preventDefault();

            const formData = new FormData(editProfileForm);


            fetch('api/update_profile.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Profile updated successfully!');
                    fetchProfile(); // Refresh the profile
                } else {
                    alert('Failed to update profile: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                alert('Error updating profile.');
            });
        });
    }

    fetchProfile(userId);
});