using UnityEngine;
using System.Collections;

public class AutoBlink : MonoBehaviour
{
    // Kéo cái mesh khuôn mặt (thường tên là Face) vào đây
    public SkinnedMeshRenderer faceMeshRenderer;
    
    // Tên của BlendShape chớp mắt (Mặc định VRM là "Blink" hoặc "Fcl_EYE_Close")
    // Bạn có thể sửa tên này trong Inspector nếu cần
    public string blinkBlendShapeName = "Blink";

    private int blinkIndex = -1;

    void Start()
    {
        // Tự động tìm xem cái BlendShape "Blink" nó nằm ở số thứ tự mấy
        if (faceMeshRenderer != null)
        {
            blinkIndex = faceMeshRenderer.sharedMesh.GetBlendShapeIndex(blinkBlendShapeName);
            
            if (blinkIndex != -1)
            {
                StartCoroutine(BlinkRoutine());
            }
            else
            {
                Debug.LogError("Không tìm thấy BlendShape tên là: " + blinkBlendShapeName);
            }
        }
    }

    IEnumerator BlinkRoutine()
    {
        while (true)
        {
            // 1. Đợi ngẫu nhiên từ 2 đến 4 giây mới chớp 1 lần
            yield return new WaitForSeconds(Random.Range(2f, 4f));

            // 2. Nhắm mắt lại (Tăng giá trị từ 0 lên 100)
            float timer = 0;
            float duration = 0.1f; // Tốc độ nhắm
            while(timer < duration)
            {
                timer += Time.deltaTime;
                float weight = Mathf.Lerp(0, 100, timer / duration);
                faceMeshRenderer.SetBlendShapeWeight(blinkIndex, weight);
                yield return null;
            }

            // 3. Mở mắt ra (Giảm từ 100 về 0)
            timer = 0;
            while(timer < duration)
            {
                timer += Time.deltaTime;
                float weight = Mathf.Lerp(100, 0, timer / duration);
                faceMeshRenderer.SetBlendShapeWeight(blinkIndex, weight);
                yield return null;
            }
        }
    }
}