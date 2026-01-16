Shader "Custom/InvisibleOccluder"
{
    SubShader
    {
        // Vẽ trước các vật thể khác để che chúng đi
        Tags { "Queue" = "Geometry-1" }
        
        Pass
        {
            // ColorMask 0 nghĩa là: KHÔNG vẽ màu gì cả (Trong suốt)
            ColorMask 0 
            
            // ZWrite On nghĩa là: Vẫn ghi lại độ sâu (Để chắn tia Raycast và che vật khác)
            ZWrite On
        }
    }
}