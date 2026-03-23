# Configuración de Supabase Storage para Imágenes

## Crear Bucket de Imágenes

1. Ve a tu proyecto Supabase: https://znyobiyzwkexzmjvixnu.supabase.co
2. Ve a **Storage** en el menú lateral
3. Haz clic en **Create a new bucket**
4. Configura:
   - Name: `experience-images`
   - Public bucket: ✅ **Activado** (para que las imágenes sean públicas)
   - File size limit: 10 MB
   - Allowed MIME types: `image/*`

5. Haz clic en **Create bucket**

## Configurar Políticas de Acceso

Una vez creado el bucket, ve a **Policies** y agrega:

### Política 1: Lectura Pública
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'experience-images' );
```

### Política 2: Upload Autenticado
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'experience-images' 
  AND auth.role() = 'authenticated'
);
```

### Política 3: Delete Propio
```sql
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'experience-images'
  AND auth.uid() = owner
);
```

## Verificar Configuración

Puedes verificar que funciona subiendo una imagen de prueba manualmente en Storage > experience-images > Upload file.

Si ves la imagen después de subirla, ¡todo está configurado correctamente! ✅
