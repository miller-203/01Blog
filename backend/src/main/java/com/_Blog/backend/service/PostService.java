package com._Blog.backend.service;

import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.CommentLikeRepository;
import com._Blog.backend.repository.CommentRepository;
import com._Blog.backend.repository.LikeRepository;
import com._Blog.backend.repository.NotificationRepository;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.ReportRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ReportRepository reportRepository;

    public Post createPost(String username, String title, String content) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setUser(user);

        Post savedPost = postRepository.save(post);

        List<User> followers = followService.getFollowersForUser(user);
        for (User follower : followers) {
            notificationService.createNotification(
                user,
                follower,
                savedPost,
                user.getUsername() + " posted: " + savedPost.getTitle(),
                "POST"
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
        commentLikeRepository.deleteByCommentPostId(id);
        likeRepository.deleteByPostId(id);
        commentRepository.deleteByPostId(id);
        notificationRepository.deleteByPostId(id);
        reportRepository.deleteByReportedPostId(id);
        postRepository.deleteById(id);
    }
}
