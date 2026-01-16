using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using UnityEngine.InputSystem; 

public class ARTapToPlaceObject : MonoBehaviour
{
    public GameObject objectToPlace;
    public ARRaycastManager raycastManager;

    private List<ARRaycastHit> hits = new List<ARRaycastHit>();

    void Update()
    {
        bool isPressed = false;
        Vector2 pointerPosition = default;

        // 1. Kiểm tra cảm ứng
        if (Touchscreen.current != null && Touchscreen.current.primaryTouch.press.wasPressedThisFrame)
        {
            isPressed = true;
            pointerPosition = Touchscreen.current.primaryTouch.position.ReadValue();
        }
        // 2. Kiểm tra chuột
        else if (Mouse.current != null && Mouse.current.leftButton.wasPressedThisFrame)
        {
            isPressed = true;
            pointerPosition = Mouse.current.position.ReadValue();
        }

        // 3. Xử lý Raycast
        if (isPressed)
        {
            if (raycastManager.Raycast(pointerPosition, hits, TrackableType.PlaneWithinPolygon))
            {
                var hitPose = hits[0].pose;

                // --- PHẦN SỬA ĐỔI ĐỂ QUAY VỀ HƯỚNG NGƯỜI DÙNG ---

                // B1: Lấy vị trí của Camera (người dùng)
                Vector3 cameraPosition = Camera.main.transform.position;

                // B2: Tính hướng từ vị trí đặt (hitPose) về phía Camera
                Vector3 directionToCamera = cameraPosition - hitPose.position;

                // B3: Quan trọng! Khóa trục Y lại bằng 0
                // Để nhân vật chỉ xoay trái phải, không bị ngửa mặt lên trời hay cắm đầu xuống đất
                directionToCamera.y = 0;

                // B4: Tạo góc quay dựa trên hướng vừa tính
                Quaternion targetRotation = Quaternion.LookRotation(directionToCamera);

                // B5: Tạo vật thể với vị trí cũ nhưng GÓC QUAY MỚI
                Instantiate(objectToPlace, hitPose.position, targetRotation);
            }
        }
    }
}