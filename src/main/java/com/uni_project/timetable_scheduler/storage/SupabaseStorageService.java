package com.uni_project.timetable_scheduler.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@Service
public class SupabaseStorageService implements CloudStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucketName;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public String uploadImage(MultipartFile file) {
        try {
            String originalName = file.getOriginalFilename();
            String extension = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf(".")) : ".jpg";
            String fileName = UUID.randomUUID().toString() + extension;

            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .header("Content-Type", file.getContentType() != null ? file.getContentType() : "image/jpeg")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Supabase storage responded with status code: " + response.statusCode());
            }

            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload profile image via regional fallback gateway", e);
        }
    }

    @Override
    public void deleteImage(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;

        try {
            String filename =  fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            String deleteUrl =  supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filename;

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(deleteUrl))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .DELETE()
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200 && response.statusCode() != 204) {
                System.err.println("Failed to delete from Supabase: " + response.body());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete from Supabase: " + e.getMessage(), e);
        }
    }
}
