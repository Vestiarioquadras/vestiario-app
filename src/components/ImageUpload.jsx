import React, { useState } from 'react'
import { Upload, Button, message, Image, Modal, Progress } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { storage } from '../config/firebaseConfig'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

/**
 * Componente para upload de imagens usando Firebase Storage
 * Gera URLs seguras e persistentes
 */
const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  maxSize = 5, // MB
  accept = 'image/*',
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  /**
   * Gera um nome único para o arquivo
   */
  const generateFileName = (file) => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    return `images/${timestamp}_${randomString}.${extension}`
  }

  /**
   * Faz upload da imagem para Firebase Storage
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

      // Gerar nome único para o arquivo
      const fileName = generateFileName(file)
      const storageRef = ref(storage, fileName)

      // Simular progresso (Firebase não tem callback de progresso nativo)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file)
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Adicionar nova imagem à lista
      const newImage = {
        id: Date.now().toString(),
        url: downloadURL,
        name: file.name,
        size: file.size,
        storagePath: fileName,
        uploadedAt: new Date().toISOString()
      }

      const updatedImages = [...images, newImage]
      onImagesChange(updatedImages)

      message.success('✅ Imagem enviada com sucesso!')
      setUploadProgress(0)
      return false // Previne upload automático do Ant Design

    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      message.error('❌ Erro ao enviar imagem')
      setUploadProgress(0)
      return false
    } finally {
      setUploading(false)
    }
  }

  /**
   * Remove imagem do Firebase Storage e da lista
   */
  const handleRemove = async (imageId) => {
    try {
      const imageToRemove = images.find(img => img.id === imageId)
      if (!imageToRemove) return

      // Deletar do Firebase Storage
      if (imageToRemove.storagePath) {
        const imageRef = ref(storage, imageToRemove.storagePath)
        await deleteObject(imageRef)
      }

      // Remover da lista
      const updatedImages = images.filter(img => img.id !== imageId)
      onImagesChange(updatedImages)

      message.success('✅ Imagem removida com sucesso!')
    } catch (error) {
      console.error('Erro ao remover imagem:', error)
      message.error('❌ Erro ao remover imagem')
    }
  }

  /**
   * Abre preview da imagem
   */
  const handlePreview = (image) => {
    setPreviewImage(image.url)
    setPreviewVisible(true)
  }

  /**
   * Props do componente Upload
   */
  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: handleUpload,
    accept: accept,
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
            
            {/* Overlay com ações */}
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
                transition: 'opacity 0.3s',
                cursor: 'pointer'
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
                <>
                  <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    Adicionar
                  </div>
                </>
              )}
            </div>
          </Upload>
        )}
      </div>

      {/* Informações */}
      <div style={{ fontSize: '12px', color: '#666' }}>
        📸 {images.length}/{maxImages} imagens • 
        Máximo {maxSize}MB por imagem • 
        Formatos: JPG, PNG, WebP
      </div>

      {/* Modal de preview */}
      <Modal
        open={previewVisible}
        title="Visualizar Imagem"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <Image
          src={previewImage}
          alt="Preview"
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  )
}

export default ImageUpload
