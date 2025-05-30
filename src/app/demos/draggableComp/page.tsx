"use client";
import { useRef } from "react";
import { FaBars, FaShoppingBag } from "react-icons/fa";

const hoodieData = [
  { src: "https://i.postimg.cc/qq3g4kRK/h1.png" },
  { src: "https://i.postimg.cc/7LKVjyfD/h2.png" },
  { src: "https://i.postimg.cc/5NfXQQs7/h5.png" },
  { src: "https://i.postimg.cc/50qxfnWx/h6.png" },
  { src: "https://i.postimg.cc/3J2ZYGdt/h3.png" },
  { src: "https://i.postimg.cc/jj1fzqDW/h4.png" },
];

export default function HoodieShowcase() {
  const contentBodyRef = useRef<HTMLDivElement>(null);
  const itemListRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-200">
      <main
        className="relative overflow-hidden overflow-y-scroll w-[400px] h-[800px] shadow-xl rounded-2xl bg-white"
        ref={contentBodyRef}
      >
        {/* Background Images */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-no-repeat"
            style={{ backgroundImage: 'url("https://i.postimg.cc/y8y4gWrP/bg1.jpg")', backgroundPosition: '-90px' }}
          />
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-no-repeat"
            style={{ backgroundImage: 'url("https://i.postimg.cc/rmzvPjyn/bg2.jpg")', backgroundPosition: '-120px' }}
          />
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-no-repeat"
            style={{ backgroundImage: 'url("https://i.postimg.cc/SsTVwb1C/bg5.jpg")', backgroundPosition: '-120px' }}
          />
        </div>
        {/* Header */}
        <header className="flex justify-between items-center px-3 py-2 text-white relative z-10">
          <div className="menu flex items-center text-2xl">
            <FaBars />
          </div>
          <div className="font-krona uppercase text-2xl tracking-wider">urban</div>
          <FaShoppingBag style={{ fontSize: 24 }} />
        </header>
        {/* Hero Title */}
        <aside className="px-5 pb-5 pt-10 mt-10 mb-[250px] relative z-10">
          <p className="font-sans uppercase text-white text-xs">New SEASON - 020</p>
          <hr className="border-t border-white my-2 w-1/2 ml-auto" />
          <h1 className="font-krona text-white text-right text-xl leading-tight">
            our<br />Hoodies<br />Collection
          </h1>
        </aside>
        {/* Item List */}
        <ul
          className="absolute left-2 top-[320px] flex gap-2 z-20"
          ref={itemListRef}
        >
          {hoodieData.map((hoodie, i) => (
            <li
              className="item flex flex-col justify-center items-center relative m-1 w-[170px] h-[220px] rounded-xl bg-white shadow-md transition-all duration-300"
              key={i}
              ref={el => {
                if (el) itemRefs.current[i] = el;
              }}
            >
              <img
                className="item-img absolute left-1/2 -translate-x-1/2 bottom-[100px] max-w-full h-auto"
                src={hoodie.src}
                alt="hoodie"
              />
              <div className="item-description absolute bottom-0 w-full text-center">
                <h1 className="uppercase px-4 pt-4 text-base font-semibold leading-tight">
                  men's dickies<br />logo hoodie
                </h1>
                <p className="font-sans text-gray-500 pb-4">$ 40.00</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
