#include <napi.h>
#include <fstream>
#include <string>
#include <iostream>

Napi::Value SaveHistory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    // 1. Validasi Input
    if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString()) {
        Napi::TypeError::New(env, "Dibutuhkan 2 argumen string: path file dan data").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string filePath = info[0].As<Napi::String>().Utf8Value();
    std::string logData = info[1].As<Napi::String>().Utf8Value();

    std::ofstream outFile(filePath, std::ios::app);

    if (outFile.is_open()) {
        outFile << logData << "\n"; 
        outFile.close();
        return Napi::Boolean::New(env, true);
    } else {
        std::cerr << "Gagal membuka file: " << filePath << std::endl;
        return Napi::Boolean::New(env, false);
    }
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "saveHistory"), 
        Napi::Function::New(env, SaveHistory)  
    );
    return exports;
}

NODE_API_MODULE(addon, Init)