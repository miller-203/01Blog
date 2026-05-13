package com._Blog.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve("avatars"));
            Files.createDirectories(rootLocation.resolve("covers"));
            Files.createDirectories(rootLocation.resolve("posts"));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    public String saveFile(MultipartFile file) {
        return saveFile(file, "posts");
    }

    public String saveFile(MultipartFile file, String directory) {
        try {
            String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "upload.bin");
            String safeName = Paths.get(originalName).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");
            String filename = UUID.randomUUID() + "_" + safeName;
            Path targetDirectory = rootLocation.resolve(directory);
            Files.createDirectories(targetDirectory);
            Files.copy(file.getInputStream(), targetDirectory.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return directory + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename(), e);
        }
    }
}
