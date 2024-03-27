'use client'; // Certifique-se de que o componente é tratado como um componente do cliente

import "./HomePage.css";
import { useRouter } from 'next/navigation'; // Importa useRouter de next/navigation

export default function HomePage() {
 const router = useRouter();

 const handleButtonClick = () => {
    router.push('/pedido');
 };

 return (
    <>
      <header className="titles-container">
          <h1 className="welcome-title">SEJA BEM VINDO!</h1>
          <h2 className="title">VAMOS TOMAR UM CAFÉZINHO HOJE?</h2>
      </header>
      <div className='image-container'>
          <img className='maua-logo' src='https://maua.br/images/logo-IMT.png' alt='IMT' />
      </div>
      <div className="div-button">
          <button className="button-order" onClick={handleButtonClick}>PEDIR</button>
      </div>
    </>
 );
};
