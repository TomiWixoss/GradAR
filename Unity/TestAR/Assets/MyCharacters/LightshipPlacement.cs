using UnityEngine;
using UnityEngine.InputSystem; 

public class LightshipPlacement : MonoBehaviour
{
    public GameObject waifuPrefab; // Kéo Waifu vào đây
    private GameObject spawnedWaifu;

    void Update()
    {
        // Biến lưu trạng thái
        bool isPressed = false;
        Vector2 pointerPosition = default;

        // 1. Kiểm tra Cảm ứng (Cho điện thoại thật)
        if (Touchscreen.current != null && Touchscreen.current.primaryTouch.press.wasPressedThisFrame)
        {
            isPressed = true;
            pointerPosition = Touchscreen.current.primaryTouch.position.ReadValue();
        }
        // 2. Kiểm tra Chuột trái (Cho Unity Editor / XR Simulation) -> BỔ SUNG ĐOẠN NÀY
        else if (Mouse.current != null && Mouse.current.leftButton.wasPressedThisFrame)
        {
            isPressed = true;
            pointerPosition = Mouse.current.position.ReadValue();
        }

        // 3. Bắn tia vật lý (Physics) nếu có nhấn
        if (isPressed)
        {
            Ray ray = Camera.main.ScreenPointToRay(pointerPosition);
            RaycastHit hit;

            // Lưu ý: Trong Editor, đảm bảo môi trường giả lập (Simulated Environment) 
            // phải có Collider thì Physics.Raycast mới trúng được nhé.
            if (Physics.Raycast(ray, out hit))
            {
                // Tính hướng xoay về Camera
                Vector3 lookPos = Camera.main.transform.position - hit.point;
                lookPos.y = 0; // Khóa trục Y
                Quaternion rotation = Quaternion.LookRotation(lookPos);

                if (spawnedWaifu == null)
                {
                    spawnedWaifu = Instantiate(waifuPrefab, hit.point, rotation);
                }
                else
                {
                    spawnedWaifu.transform.position = hit.point;
                    spawnedWaifu.transform.rotation = rotation;
                }
            }
        }
    }
}