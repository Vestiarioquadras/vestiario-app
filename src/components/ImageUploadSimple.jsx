import React, { useState } from 'react'
import { Upload, Button, Image, message, Progress } from 'antd'
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'

const ImageUploadSimple = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  maxSize = 5,
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  /**
   * Converte arquivo para base64
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })
  }

  /**
   * Faz upload da imagem (converte para base64)
   */
  const handleUpload = async (file) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      // Validar tamanho do arquivo
      if (file.size > maxSize * 1024 * 1024) {
        message.error(`Arquivo muito grande! Máximo permitido: ${maxSize}MB`)
        return false
      }

      // Validar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        message.error('Apenas arquivos de imagem são permitidos!')
        return false
      }

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      // Converter para base64
      const base64 = await fileToBase64(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Adicionar nova imagem à lista
      const newImage = {
        id: Date.now().toString(),
        url: base64,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }

      const updatedImages = [...images, newImage]
      onImagesChange(updatedImages)

      message.success('✅ Imagem adicionada com sucesso!')
      setUploadProgress(0)
      setUploading(false)
      return false // Previne upload automático do Ant Design

    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      message.error('❌ Erro ao processar imagem')
      setUploadProgress(0)
      setUploading(false)
      return false
    }
  }

  /**
   * Remove imagem da lista
   */
  const handleRemove = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId)
    onImagesChange(updatedImages)
    message.success('🗑️ Imagem removida!')
  }

  /**
   * Visualizar imagem em modal
   */
  const handlePreview = (image) => {
    setPreviewImage(image.url)
    setPreviewVisible(true)
  }

  const uploadProps = {
    beforeUpload: handleUpload,
    showUploadList: false,
    accept: 'image/*',
    disabled: disabled || uploading || images.length >= maxImages
  }

  return (
    <div>
      {/* Lista de imagens */}
      <div style={{
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px',
        marginBottom: '16px'
      }}>
        {images.map((image, index) => (
          <div
            key={image.id || `image-${index}`}
            style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Image
              src={image.url}
              alt={image.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              preview={false}
            />
            
            {/* Overlay com botões */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(image)}
                  style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none' }}
                />
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(image.id)}
                  style={{ background: 'rgba(255, 77, 79, 0.8)', border: 'none' }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Botão de adicionar */}
        {images.length < maxImages && (
          <Upload {...uploadProps}>
            <div
              style={{
                width: '100px',
                height: '100px',
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled || uploading ? 'not-allowed' : 'pointer',
                background: disabled || uploading ? '#f5f5f5' : '#fafafa',
                opacity: disabled || uploading ? 0.6 : 1
              }}
            >
              {uploading ? (
                <div style={{ textAlign: 'center' }}>
                  <Progress 
                    type="circle" 
                    size={40} 
                    percent={uploadProgress}
                    strokeColor="#1890ff"
                  />
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>
                    Enviando...
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
                  <div style={{ fontSize: '10px', marginTop: '4px', color: '#999' }}>
                    Adicionar
                  </div>
                </div>
              )}
            </div>
          </Upload>
        )}
      </div>

      {/* Informações */}
      <div style={{ fontSize: '12px', color: '#666' }}>
        📸 Máximo {maxImages} imagens • Tamanho máximo: {maxSize}MB cada
        {images.length > 0 && (
          <span style={{ marginLeft: '8px' }}>
            • {images.length}/{maxImages} imagens
          </span>
        )}
      </div>

      {/* Modal de preview */}
      {previewVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setPreviewVisible(false)}
        >
          <div style={{ maxWidth: '90%', maxHeight: '90%' }}>
            <Image
              src={previewImage}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploadSimple
