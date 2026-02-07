package com._Blog.backend.service;

import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com._Blog.backend.service.FollowService;
import com._Blog.backend.service.NotificationService;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FollowService followService;

    @Autowired
    private NotificationService notificationService;

    public Post createPost(String username, String title, String content) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setUser(user);

        // 1. Save the post FIRST so it gets an ID
        Post savedPost = postRepository.save(post);

        // 2. Now handle notifications using the savedPost
        List<User> followers = followService.getFollowersForUser(user);
        for (User follower : followers) {
            notificationService.createNotification(
                user,        // Sender
                follower,    // Recipient
                savedPost,   // The post (now has an ID!)
                user.getUsername() + " posted: " + savedPost.getTitle()
            );
        }

        return savedPost;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }
    public void savePost(Post post) {
        postRepository.save(post);
    }
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}