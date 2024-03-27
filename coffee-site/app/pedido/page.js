// /app/pedido/page.js
'use client'; // Diretiva necessária para componentes do lado do cliente no App Router

import React, { useState, useEffect } from 'react';
import './OrderPage.css'; // Certifique-se de que o caminho do arquivo CSS está correto
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation'; // Importação do useRouter do Next.js

const OrderPage = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const router = useRouter(); // Uso do useRouter para navegação

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleChangeInput = (event) => {
        setInputValue(event.target.value);
    };

    const startCamera = async () => {
        setIsCameraActive(true);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error('A câmera não está disponível neste dispositivo.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            const video = document.getElementById('video');
            if (video) video.srcObject = stream;
        } catch (error) {
            toast.error('Erro ao acessar a câmera.');
        }
    };

    const takePhoto = () => {
        const video = document.getElementById('video');
        const canvas = document.createElement('canvas');
        const maxWidth = 300; // Defina a largura máxima desejada
        const maxHeight = 300; // Defina a altura máxima desejada
        let width = video.videoWidth;
        let height = video.videoHeight;
    
        // Redimensionar a imagem mantendo a proporção
        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }
    
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);
        const photo = canvas.toDataURL('image/jpeg');
    
        const blob = dataURLtoBlob(photo);
        const file = new File([blob], "takenPhoto.jpg", { type: "image/jpeg" });
    
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setCameraStream(null);
        setIsCameraActive(false);
    };

    const dataURLtoBlob = (dataURL) => {
        const binary = atob(dataURL.split(',')[1]);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setIsCameraActive(false); // Garante que a câmera seja desligada ao escolher um arquivo
    };

    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const handleClick = async () => {
        if (!selectedOption || !inputValue || !selectedFile) {
            toast.error('Por favor, preencha todos os campos.');
            return;
        }
    
        setIsLoading(true);
    
        const formData = new FormData();
        formData.append('name', inputValue);
        formData.append('coffeeType', selectedOption);
        formData.append('photo', selectedFile);
    
        try {
            const printerResponse = await fetch('http://localhost:5000/Printer_Script', { // Mude pro IP do PC
                method: 'POST',
                body: formData
            });
    
            if (printerResponse.ok) {
                const dbResponse = await fetch('http://localhost:5000/DB_Script', { // Mude pro IP do PC
                    method: 'POST',
                    body: new URLSearchParams({
                        name: inputValue,
                        coffeeType: selectedOption
                    })
                });
    
                if (dbResponse.ok) {
                    setIsLoading(false);
                    router.push('/'); // Navegação para a página inicial
                    toast.success('Pedido enviado com sucesso!');
                } else {
                    throw new Error('Erro ao inserir dados no banco.');
                }
            } else {
                throw new Error('Erro ao executar o script de impressão.');
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Erro ao executar os scripts:', error);
            toast.error('Erro ao enviar o pedido.');
        }
    };

    const HandleClick2 = () => {
        router.push('/'); // Navegação para a página inicial
    }

    return (
        <>
            <div>
                <ToastContainer 
                theme='colored'
                autoClose={2000}
                transition={Zoom}
                newestOnTop/>
                <header className="titles-container">
                    <h1 className="welcome-title">FAÇA SEU PEDIDO</h1>
                </header>
                <div className='div-button2'>
                    <button className='button-back' onClick={HandleClick2}>VOLTAR</button>
                </div>
                <form>
                    <span className="input-container">
                        <label htmlFor="inputText">Digite seu nome:</label>
                        <input
                            type="text"
                            id="inputText"
                            value={inputValue}
                            onChange={handleChangeInput}
                        />
                    </span>
                    <span className="dropdown-container">
                        <label htmlFor="options">Selecione um café:</label>
                        <select id="options" value={selectedOption} onChange={handleOptionChange}>
                            <option value="">Selecione</option>
                            <option value="2">Puro</option>
                            <option value="0">Capuccinno</option>
                            <option value="1">Creme Brulé</option>
                        </select>
                    </span>
                    {!isCameraActive && (
                        <span className="file-container">
                            <label htmlFor="fileInput">Selecione uma foto:</label>
                            <input
                                type="file"
                                id="fileInput"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </span>
                    )}
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <video id="video" autoPlay muted playsInline style={{ display: cameraStream ? 'block' : 'none' }}></video>
                    </div>
                    <div className="image-container2">
                        {!isCameraActive && selectedFile && <img src={URL.createObjectURL(selectedFile)} alt="Foto selecionada" className="preview-image" />}
                    </div>
                </form>
                <div className='div-button'>
                    {!isCameraActive && (
                        <button className="button-camera" onClick={startCamera}>ABRIR CÂMERA</button>
                    )}
                    <button className="button-take-photo" onClick={takePhoto} style={{ display: cameraStream ? 'block' : 'none' }}>TIRAR FOTO</button>
                    <button className="button-send-order" onClick={handleClick}>ENVIAR</button>
                </div>
                {/* Contêiner para o elemento de vídeo com z-index alto */}
                <div className={`loading-overlay ${isLoading ? 'visible' : ''}`}>
                    <div className='spinner-container'>
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderPage;
