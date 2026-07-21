package com.uni_project.timetable_scheduler.storage;

import org.springframework.web.multipart.MultipartFile;

public interface CloudStorageService {

    String uploadImage(MultipartFile file);

    void deleteImage(String imageUrl);
}
