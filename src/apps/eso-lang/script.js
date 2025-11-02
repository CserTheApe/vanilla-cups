const LANGS = [
    'Brainfuck',
    '1+'
];
let sLang = LANGS[0];

let appInputSection = document.getElementById('app-input-section');
let codeTextarea = document.getElementById('code-text');
let inputTextarea = document.getElementById('input-text');
let outputTextarea = document.getElementById('output-text');
let memSizeInput = document.getElementById('mem-size');
memSizeInput.value = 300;

let langSelect = document.getElementById("lang-select");
langSelect.addEventListener("change", (e) => {
    sLang = e.target.value;
});
for (let lang of LANGS) {
    const langOption = document.createElement("option");
    langOption.value = lang;
    langOption.innerHTML = lang;
    langSelect.appendChild(langOption);
}

let execBtn = document.getElementById("execute");
execBtn.addEventListener("click", () => {
    appInputSection.inert = true;
    execBtn.disabled = true;
    switch(sLang) {
        case 'Brainfuck':
            executeBrainfuck();
            break;
        case '1+':
            createMessageModal("WIP");
            break;
    }
    appInputSection.inert = false;
    execBtn.disabled = false;
})

function executeBrainfuck() {
    let codeText = codeTextarea.value;
    let inputText = inputTextarea.value;
    let outputText = '';
    let memSize = Number(memSizeInput.value);
    let memory = new Array(memSize >= 10 && memSize <= 30000 ? memSize : 300).fill(0);
    console.log(memSize, memory.length);
    let loopStack = [];
    let instPtr = 0;
    let inPtr = 0;
    let memPtr = 0;
    
    while(instPtr < codeText.length) {
        let inst = codeText[instPtr];
        let tempVal;
        switch(inst) {
            case '<':
                memPtr--;
                if(memPtr < 0) memPtr += memory.length;
                break;
            case '>':
                memPtr++;
                if(memPtr >= memory.length) memPtr = 0;
                break;
            case '+':
                tempVal = memory[memPtr] + 1;
                if(tempVal > 255) tempVal = 0;
                memory[memPtr] = tempVal;
                break;
            case '-':
                tempVal = memory[memPtr] - 1;
                if(tempVal < 0) tempVal = 255;
                memory[memPtr] = tempVal;
                break;
            case '[':
                loopStack.push(instPtr);
                break;
            case ']':
                if(memory[memPtr] == 0) {
                    loopStack.pop();
                }
                else {
                    instPtr = loopStack[loopStack.length - 1];
                }
                break;
            case '.':
                outputText += String.fromCharCode(memory[memPtr]);
                outputTextarea.value = outputText;
                break;
            case ',':
                if(inPtr >= inputText.length) {
                    createNormalModal("Error","Input not found");
                    return;
                }
                memory[memPtr] = inputText.charCodeAt(inPtr);
                inPtr++;
                break;
        }
        instPtr++;
    }
}



function openUtfTable() {
    createNormalModal(
        "UTF-16 Table",
        `<div style='overflow: auto;'><table>
            <thead>
            <tr>
                <th>Dec</th><th class='th-separator'>UTF-16</th>
                <th>Dec</th><th class='th-separator'>UTF-16</th>
                <th>Dec</th><th class='th-separator'>UTF-16</th>
                <th>Dec</th><th class='th-separator'>UTF-16</th>
                <th>Dec</th><th class='th-separator'>UTF-16</th>
                <th>Dec</th><th class='th-separator'>UTF-16</th>
                <th>Dec</th><th class='th-separator'>UTF-16</th>
                <th>Dec</th><th class='th-separator'>UTF-16</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>0</td><td class='td-separator'>NUL</td>
                <td>32</td><td class='td-separator'>SP</td>
                <td>64</td><td class='td-separator'>@</td>
                <td>96</td><td class='td-separator'>\`</td>
                <td>128</td><td class='td-separator'>${String.fromCharCode(128)}</td>
                <td>160</td><td class='td-separator'>NBSP</td>
                <td>192</td><td class='td-separator'>${String.fromCharCode(192)}</td>
                <td>224</td><td class='td-separator'>${String.fromCharCode(224)}</td>
            </tr>
            <tr>
                <td>1</td><td class='td-separator'>SOH</td>
                <td>33</td><td class='td-separator'>!</td>
                <td>65</td><td class='td-separator'>A</td>
                <td>97</td><td class='td-separator'>a</td>
                <td>129</td><td class='td-separator'>${String.fromCharCode(129)}</td>
                <td>161</td><td class='td-separator'>${String.fromCharCode(161)}</td>
                <td>193</td><td class='td-separator'>${String.fromCharCode(193)}</td>
                <td>225</td><td class='td-separator'>${String.fromCharCode(225)}</td>
            </tr>
            <tr>
                <td>2</td><td class='td-separator'>STX</td>
                <td>34</td><td class='td-separator'>"</td>
                <td>66</td><td class='td-separator'>B</td>
                <td>98</td><td class='td-separator'>b</td>
                <td>130</td><td class='td-separator'>${String.fromCharCode(130)}</td>
                <td>162</td><td class='td-separator'>${String.fromCharCode(162)}</td>
                <td>194</td><td class='td-separator'>${String.fromCharCode(194)}</td>
                <td>226</td><td class='td-separator'>${String.fromCharCode(226)}</td>
            </tr>
            <tr>
                <td>3</td><td class='td-separator'>ETX</td>
                <td>35</td><td class='td-separator'>#</td>
                <td>67</td><td class='td-separator'>C</td>
                <td>99</td><td class='td-separator'>c</td>
                <td>131</td><td class='td-separator'>${String.fromCharCode(131)}</td>
                <td>163</td><td class='td-separator'>${String.fromCharCode(163)}</td>
                <td>195</td><td class='td-separator'>${String.fromCharCode(195)}</td>
                <td>227</td><td class='td-separator'>${String.fromCharCode(227)}</td>
            </tr>
            <tr>
                <td>4</td><td class='td-separator'>EOT</td>
                <td>36</td><td class='td-separator'>$</td>
                <td>68</td><td class='td-separator'>D</td>
                <td>100</td><td class='td-separator'>d</td>
                <td>132</td><td class='td-separator'>${String.fromCharCode(132)}</td>
                <td>164</td><td class='td-separator'>${String.fromCharCode(164)}</td>
                <td>196</td><td class='td-separator'>${String.fromCharCode(196)}</td>
                <td>228</td><td class='td-separator'>${String.fromCharCode(228)}</td>
            </tr>
            <tr>
                <td>5</td><td class='td-separator'>ENQ</td>
                <td>37</td><td class='td-separator'>%</td>
                <td>69</td><td class='td-separator'>E</td>
                <td>101</td><td class='td-separator'>e</td>
                <td>133</td><td class='td-separator'>${String.fromCharCode(133)}</td>
                <td>165</td><td class='td-separator'>${String.fromCharCode(165)}</td>
                <td>197</td><td class='td-separator'>${String.fromCharCode(197)}</td>
                <td>229</td><td class='td-separator'>${String.fromCharCode(229)}</td>
            </tr>
            <tr>
                <td>6</td><td class='td-separator'>ACK</td>
                <td>38</td><td class='td-separator'>&</td>
                <td>70</td><td class='td-separator'>F</td>
                <td>102</td><td class='td-separator'>f</td>
                <td>134</td><td class='td-separator'>${String.fromCharCode(134)}</td>
                <td>166</td><td class='td-separator'>${String.fromCharCode(166)}</td>
                <td>198</td><td class='td-separator'>${String.fromCharCode(198)}</td>
                <td>230</td><td class='td-separator'>${String.fromCharCode(230)}</td>
            </tr>
            <tr>
                <td>7</td><td class='td-separator'>BEL</td>
                <td>39</td><td class='td-separator'>'</td>
                <td>71</td><td class='td-separator'>G</td>
                <td>103</td><td class='td-separator'>g</td>
                <td>135</td><td class='td-separator'>${String.fromCharCode(135)}</td>
                <td>167</td><td class='td-separator'>${String.fromCharCode(167)}</td>
                <td>199</td><td class='td-separator'>${String.fromCharCode(199)}</td>
                <td>231</td><td class='td-separator'>${String.fromCharCode(231)}</td>
            </tr>
            <tr>
                <td>8</td><td class='td-separator'>BS</td>
                <td>40</td><td class='td-separator'>(</td>
                <td>72</td><td class='td-separator'>H</td>
                <td>104</td><td class='td-separator'>h</td>
                <td>136</td><td class='td-separator'>${String.fromCharCode(136)}</td>
                <td>168</td><td class='td-separator'>${String.fromCharCode(168)}</td>
                <td>200</td><td class='td-separator'>${String.fromCharCode(200)}</td>
                <td>232</td><td class='td-separator'>${String.fromCharCode(232)}</td>
            </tr>
            <tr>
                <td>9</td><td class='td-separator'>HT</td>
                <td>41</td><td class='td-separator'>)</td>
                <td>73</td><td class='td-separator'>I</td>
                <td>105</td><td class='td-separator'>i</td>
                <td>137</td><td class='td-separator'>${String.fromCharCode(137)}</td>
                <td>169</td><td class='td-separator'>${String.fromCharCode(169)}</td>
                <td>201</td><td class='td-separator'>${String.fromCharCode(201)}</td>
                <td>233</td><td class='td-separator'>${String.fromCharCode(233)}</td>
            </tr>
            <tr>
                <td>10</td><td class='td-separator'>LF</td>
                <td>42</td><td class='td-separator'>*</td>
                <td>74</td><td class='td-separator'>J</td>
                <td>106</td><td class='td-separator'>j</td>
                <td>138</td><td class='td-separator'>${String.fromCharCode(138)}</td>
                <td>170</td><td class='td-separator'>${String.fromCharCode(170)}</td>
                <td>202</td><td class='td-separator'>${String.fromCharCode(202)}</td>
                <td>234</td><td class='td-separator'>${String.fromCharCode(234)}</td>
            </tr>
            <tr>
                <td>11</td><td class='td-separator'>VT</td>
                <td>43</td><td class='td-separator'>+</td>
                <td>75</td><td class='td-separator'>K</td>
                <td>107</td><td class='td-separator'>k</td>
                <td>139</td><td class='td-separator'>${String.fromCharCode(139)}</td>
                <td>171</td><td class='td-separator'>${String.fromCharCode(171)}</td>
                <td>203</td><td class='td-separator'>${String.fromCharCode(203)}</td>
                <td>235</td><td class='td-separator'>${String.fromCharCode(235)}</td>
            </tr>
            <tr>
                <td>12</td><td class='td-separator'>FF</td>
                <td>44</td><td class='td-separator'>,</td>
                <td>76</td><td class='td-separator'>L</td>
                <td>108</td><td class='td-separator'>l</td>
                <td>140</td><td class='td-separator'>${String.fromCharCode(140)}</td>
                <td>172</td><td class='td-separator'>${String.fromCharCode(172)}</td>
                <td>204</td><td class='td-separator'>${String.fromCharCode(204)}</td>
                <td>236</td><td class='td-separator'>${String.fromCharCode(236)}</td>
            </tr>
            <tr>
                <td>13</td><td class='td-separator'>CR</td>
                <td>45</td><td class='td-separator'>-</td>
                <td>77</td><td class='td-separator'>M</td>
                <td>109</td><td class='td-separator'>m</td>
                <td>141</td><td class='td-separator'>${String.fromCharCode(141)}</td>
                <td>173</td><td class='td-separator'>SHY</td>
                <td>205</td><td class='td-separator'>${String.fromCharCode(205)}</td>
                <td>237</td><td class='td-separator'>${String.fromCharCode(237)}</td>
            </tr>
            <tr>
                <td>14</td><td class='td-separator'>SO</td>
                <td>46</td><td class='td-separator'>.</td>
                <td>78</td><td class='td-separator'>N</td>
                <td>110</td><td class='td-separator'>n</td>
                <td>142</td><td class='td-separator'>${String.fromCharCode(142)}</td>
                <td>174</td><td class='td-separator'>${String.fromCharCode(174)}</td>
                <td>206</td><td class='td-separator'>${String.fromCharCode(206)}</td>
                <td>238</td><td class='td-separator'>${String.fromCharCode(238)}</td>
            </tr>
            <tr>
                <td>15</td><td class='td-separator'>SI</td>
                <td>47</td><td class='td-separator'>/</td>
                <td>79</td><td class='td-separator'>O</td>
                <td>111</td><td class='td-separator'>o</td>
                <td>143</td><td class='td-separator'>${String.fromCharCode(143)}</td>
                <td>175</td><td class='td-separator'>${String.fromCharCode(175)}</td>
                <td>207</td><td class='td-separator'>${String.fromCharCode(207)}</td>
                <td>239</td><td class='td-separator'>${String.fromCharCode(239)}</td>
            </tr>
            <tr>
                <td>16</td><td class='td-separator'>DLE</td>
                <td>48</td><td class='td-separator'>0</td>
                <td>80</td><td class='td-separator'>P</td>
                <td>112</td><td class='td-separator'>p</td>
                <td>144</td><td class='td-separator'>${String.fromCharCode(144)}</td>
                <td>176</td><td class='td-separator'>${String.fromCharCode(176)}</td>
                <td>208</td><td class='td-separator'>${String.fromCharCode(208)}</td>
                <td>240</td><td class='td-separator'>${String.fromCharCode(240)}</td>
            </tr>
            <tr>
                <td>17</td><td class='td-separator'>DC1</td>
                <td>49</td><td class='td-separator'>1</td>
                <td>81</td><td class='td-separator'>Q</td>
                <td>113</td><td class='td-separator'>q</td>
                <td>145</td><td class='td-separator'>${String.fromCharCode(145)}</td>
                <td>177</td><td class='td-separator'>${String.fromCharCode(177)}</td>
                <td>209</td><td class='td-separator'>${String.fromCharCode(209)}</td>
                <td>241</td><td class='td-separator'>${String.fromCharCode(241)}</td>
            </tr>
            <tr>
                <td>18</td><td class='td-separator'>DC2</td>
                <td>50</td><td class='td-separator'>2</td>
                <td>82</td><td class='td-separator'>R</td>
                <td>114</td><td class='td-separator'>r</td>
                <td>146</td><td class='td-separator'>${String.fromCharCode(146)}</td>
                <td>178</td><td class='td-separator'>${String.fromCharCode(178)}</td>
                <td>210</td><td class='td-separator'>${String.fromCharCode(210)}</td>
                <td>242</td><td class='td-separator'>${String.fromCharCode(242)}</td>
            </tr>
            <tr>
                <td>19</td><td class='td-separator'>DC3</td>
                <td>51</td><td class='td-separator'>3</td>
                <td>83</td><td class='td-separator'>S</td>
                <td>115</td><td class='td-separator'>s</td>
                <td>147</td><td class='td-separator'>${String.fromCharCode(147)}</td>
                <td>179</td><td class='td-separator'>${String.fromCharCode(179)}</td>
                <td>211</td><td class='td-separator'>${String.fromCharCode(211)}</td>
                <td>243</td><td class='td-separator'>${String.fromCharCode(243)}</td>
            </tr>
            <tr>
                <td>20</td><td class='td-separator'>DC4</td>
                <td>52</td><td class='td-separator'>4</td>
                <td>84</td><td class='td-separator'>T</td>
                <td>116</td><td class='td-separator'>t</td>
                <td>148</td><td class='td-separator'>${String.fromCharCode(148)}</td>
                <td>180</td><td class='td-separator'>${String.fromCharCode(180)}</td>
                <td>212</td><td class='td-separator'>${String.fromCharCode(212)}</td>
                <td>244</td><td class='td-separator'>${String.fromCharCode(244)}</td>
            </tr>
            <tr>
                <td>21</td><td class='td-separator'>NAK</td>
                <td>53</td><td class='td-separator'>5</td>
                <td>85</td><td class='td-separator'>U</td>
                <td>117</td><td class='td-separator'>u</td>
                <td>149</td><td class='td-separator'>${String.fromCharCode(149)}</td>
                <td>181</td><td class='td-separator'>${String.fromCharCode(181)}</td>
                <td>213</td><td class='td-separator'>${String.fromCharCode(213)}</td>
                <td>245</td><td class='td-separator'>${String.fromCharCode(245)}</td>
            </tr>
            <tr>
                <td>22</td><td class='td-separator'>SYN</td>
                <td>54</td><td class='td-separator'>6</td>
                <td>86</td><td class='td-separator'>V</td>
                <td>118</td><td class='td-separator'>v</td>
                <td>150</td><td class='td-separator'>${String.fromCharCode(150)}</td>
                <td>182</td><td class='td-separator'>${String.fromCharCode(182)}</td>
                <td>214</td><td class='td-separator'>${String.fromCharCode(214)}</td>
                <td>246</td><td class='td-separator'>${String.fromCharCode(246)}</td>
            </tr>
            <tr>
                <td>23</td><td class='td-separator'>ETB</td>
                <td>55</td><td class='td-separator'>7</td>
                <td>87</td><td class='td-separator'>W</td>
                <td>119</td><td class='td-separator'>w</td>
                <td>151</td><td class='td-separator'>${String.fromCharCode(151)}</td>
                <td>183</td><td class='td-separator'>${String.fromCharCode(183)}</td>
                <td>215</td><td class='td-separator'>${String.fromCharCode(215)}</td>
                <td>247</td><td class='td-separator'>${String.fromCharCode(247)}</td>
            </tr>
            <tr>
                <td>24</td><td class='td-separator'>CAN</td>
                <td>56</td><td class='td-separator'>8</td>
                <td>88</td><td class='td-separator'>X</td>
                <td>120</td><td class='td-separator'>x</td>
                <td>152</td><td class='td-separator'>${String.fromCharCode(152)}</td>
                <td>184</td><td class='td-separator'>${String.fromCharCode(184)}</td>
                <td>216</td><td class='td-separator'>${String.fromCharCode(216)}</td>
                <td>248</td><td class='td-separator'>${String.fromCharCode(248)}</td>
            </tr>
            <tr>
                <td>25</td><td class='td-separator'>EM</td>
                <td>57</td><td class='td-separator'>9</td>
                <td>89</td><td class='td-separator'>Y</td>
                <td>121</td><td class='td-separator'>y</td>
                <td>153</td><td class='td-separator'>${String.fromCharCode(153)}</td>
                <td>185</td><td class='td-separator'>${String.fromCharCode(185)}</td>
                <td>217</td><td class='td-separator'>${String.fromCharCode(217)}</td>
                <td>249</td><td class='td-separator'>${String.fromCharCode(249)}</td>
            </tr>
            <tr>
                <td>26</td><td class='td-separator'>SUB</td>
                <td>58</td><td class='td-separator'>:</td>
                <td>90</td><td class='td-separator'>Z</td>
                <td>122</td><td class='td-separator'>z</td>
                <td>154</td><td class='td-separator'>${String.fromCharCode(154)}</td>
                <td>186</td><td class='td-separator'>${String.fromCharCode(186)}</td>
                <td>218</td><td class='td-separator'>${String.fromCharCode(218)}</td>
                <td>250</td><td class='td-separator'>${String.fromCharCode(250)}</td>
            </tr>
            <tr>
                <td>27</td><td class='td-separator'>ESC</td>
                <td>59</td><td class='td-separator'>;</td>
                <td>91</td><td class='td-separator'>[</td>
                <td>123</td><td class='td-separator'>{</td>
                <td>155</td><td class='td-separator'>${String.fromCharCode(155)}</td>
                <td>187</td><td class='td-separator'>${String.fromCharCode(187)}</td>
                <td>219</td><td class='td-separator'>${String.fromCharCode(219)}</td>
                <td>251</td><td class='td-separator'>${String.fromCharCode(251)}</td>
            </tr>
            <tr>
                <td>28</td><td class='td-separator'>FS</td>
                <td>60</td><td class='td-separator'>\<</td>
                <td>92</td><td class='td-separator'>\\</td>
                <td>124</td><td class='td-separator'>|</td>
                <td>156</td><td class='td-separator'>${String.fromCharCode(156)}</td>
                <td>188</td><td class='td-separator'>${String.fromCharCode(188)}</td>
                <td>220</td><td class='td-separator'>${String.fromCharCode(220)}</td>
                <td>252</td><td class='td-separator'>${String.fromCharCode(252)}</td>
            </tr>
            <tr>
                <td>29</td><td class='td-separator'>GS</td>
                <td>61</td><td class='td-separator'>=</td>
                <td>93</td><td class='td-separator'>]</td>
                <td>125</td><td class='td-separator'>}</td>
                <td>157</td><td class='td-separator'>${String.fromCharCode(157)}</td>
                <td>189</td><td class='td-separator'>${String.fromCharCode(189)}</td>
                <td>221</td><td class='td-separator'>${String.fromCharCode(221)}</td>
                <td>253</td><td class='td-separator'>${String.fromCharCode(253)}</td>
            </tr>
            <tr>
                <td>30</td><td class='td-separator'>RS</td>
                <td>62</td><td class='td-separator'>\></td>
                <td>94</td><td class='td-separator'>^</td>
                <td>126</td><td class='td-separator'>~</td>
                <td>158</td><td class='td-separator'>${String.fromCharCode(158)}</td>
                <td>190</td><td class='td-separator'>${String.fromCharCode(190)}</td>
                <td>222</td><td class='td-separator'>${String.fromCharCode(222)}</td>
                <td>254</td><td class='td-separator'>${String.fromCharCode(254)}</td>
            </tr>
            <tr>
                <td>31</td><td class='td-separator'>US</td>
                <td>63</td><td class='td-separator'>?</td>
                <td>95</td><td class='td-separator'>_</td>
                <td>127</td><td class='td-separator'>DEL</td>
                <td>159</td><td class='td-separator'>${String.fromCharCode(159)}</td>
                <td>191</td><td class='td-separator'>${String.fromCharCode(191)}</td>
                <td>223</td><td class='td-separator'>${String.fromCharCode(223)}</td>
                <td>255</td><td class='td-separator'>${String.fromCharCode(255)}</td>
            </tr>
            </tbody>
        </table></div>`
    )
}